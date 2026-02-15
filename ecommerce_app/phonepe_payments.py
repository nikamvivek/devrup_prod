# phonepe_api.py
# This file contains the core logic for interacting with the PhonePe SDK.
import uuid
from django.conf import settings
from phonepe.sdk.pg.payments.v2.standard_checkout_client import StandardCheckoutClient
from phonepe.sdk.pg.payments.v2.models.request.standard_checkout_pay_request import StandardCheckoutPayRequest
from phonepe.sdk.pg.env import Env

# --- CONFIGURATION ---
# It's best practice to load these from environment variables in a real application.
# For demonstration purposes, we are using the sandbox test credentials directly.
# Remember to change these to your production credentials when deploying.
CLIENT_ID = settings.PHONEPE_CLIENT_ID  # Replace with your actual PhonePe client ID
CLIENT_SECRET = settings.PHONEPE_CLIENT_SECRET # Replace with your actual PhonePe client secret
CLIENT_VERSION = settings.PHONEPE_CLIENT_VERSION  # Typically 1 for the current version
# ENV = Env.SANDBOX
ENV = Env.PRODUCTION
should_publish_events = False
# Initialize the PhonePe client instance once
try:
    phonepe_client = StandardCheckoutClient.get_instance(
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        client_version=CLIENT_VERSION,
        env=ENV
    )
except Exception as e:
    # Log the error and handle the application's failure to initialize the client
    print(f"Failed to initialize PhonePe client: {e}")
    phonepe_client = None


def initiate_payment(amount_in_paise: int, merchant_order_id: str, redirect_url: str):
    # https://developer.phonepe.com/payment-gateway/backend-sdk/python-be-sdk/sdk-reference-python/initiate-payment
    """
    Initiates a payment with the PhonePe gateway.

    Args:
        amount_in_paise: The total amount in paise (e.g., Rs 100.50 is 10050).
        booking_id: The ID of your internal booking/order.
        redirect_url: The URL the user is redirected to after payment.

    Returns:
        A dictionary with the PhonePe redirect URL and merchant order ID, or an error message.
    """
    if not phonepe_client:
        return {"success": False, "error": "PhonePe client is not initialized."}

    # Generate a unique merchant order ID for this transaction.
    # It's good practice to make it unique per transaction and include a prefix.
    # merchant_order_id = f"ORDER_{booking_id}_{uuid.uuid4().hex[:8].upper()}"
    
    try:
        # The 'user_id' parameter is not a direct argument for this specific SDK method.
        # Removing it to resolve the error.
        pay_request = StandardCheckoutPayRequest.build_request(
            merchant_order_id=merchant_order_id,
            amount=amount_in_paise,
            redirect_url=redirect_url,
        )
        pay_response = phonepe_client.pay(pay_request)
        
        # The 'pay_response' object from the SDK contains the redirect URL.
        # We also return the merchant order ID to be saved in our database.
        return {
            "success": True,
            "redirect_url": pay_response.redirect_url,
            "merchant_order_id": merchant_order_id,
            "pg_txn_id": pay_response.order_id,
            # "state": pay_response.state,
            # "expire_at": pay_response.expire_at
        }
    except Exception as e:
        print(f"PhonePe payment initiation failed: {e}")
        return {"success": False, "error": str(e)}
    
# phonepe_payments.py (add this method to your existing file)
# from phonepe.sdk.pg.payments.v2.models.response.order_status_response import OrderStatusResponse

def check_order_status(merchant_order_id: str, details: bool = False) -> dict:
    """
    Check payment status with PhonePe's API
    
    Args:
        merchant_order_id: Your system's order ID (stored in Transaction.merchant_order_id)
        details: Whether to include full payment attempt details
        
    Returns:
        Dictionary with:
        - success: bool
        - data: Order status details if successful
        - error: str if failed
    """
    try:
        if not phonepe_client:
            return {
                'success': False,
                'error': 'PhonePe client not initialized'
            }

        # Make API call to PhonePe
        response = phonepe_client.get_order_status(
            merchant_order_id=merchant_order_id,
            details=details
        )

        # Convert OrderStatusResponse to dict
        status_data = {
            'orderId': response.orderId,
            'state': response.state,
            'expireAt': response.expireAt,
            'amount': response.amount,
            'metaInfo': response.metaInfo,
            'errorCode': getattr(response, 'errorCode', None),
            'detailedErrorCode': getattr(response, 'detailedErrorCode', None),
            'paymentDetails': [
                {
                    'method': pd.method,
                    'amount': pd.amount,
                    'time': pd.time,
                    'status': pd.status
                } 
                for pd in getattr(response, 'paymentDetails', [])
            ] if details else None
        }

        return {
            'success': True,
            'data': status_data
        }

    except Exception as e:
        logger.error(f"PhonePe status check failed for order {merchant_order_id}: {str(e)}")
        return {
            'success': False,
            'error': f"Status check failed: {str(e)}"
        }

# payments.py
# from phonepe.sdk.pg.payments.v2.models.response.callback_response import CallbackResponse
import logging

logger = logging.getLogger(__name__)

# phonepe_api.py
def verify_phonepe_webhook(request) -> tuple[bool, dict]:
    """
    Validates PhonePe webhook request per official docs.
    Returns tuple: (is_valid: bool, callback_data: dict or None)
    """
    try:
        # 1. Extract raw data
        raw_body = request.body.decode('utf-8')
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            logger.warning("Missing Authorization header in webhook")
            return False, None

        # 2. Validate using PhonePe SDK
        callback_response = phonepe_client.validate_callback(
            username=settings.PHONEPE_WEBHOOK_USERNAME,
            password=settings.PHONEPE_WEBHOOK_PASSWORD,
            callback_header_data=auth_header,
            callback_response_data=raw_body
        )
        
        # 3. Process response per latest specs
        payload = callback_response.payload
        return True, {
            'event': payload['event'],  # Mandatory (replaces 'type')
            'state': payload['state'],  # Only trusted status source
            'merchant_transaction_id': payload['merchantTransactionId'],
            'transaction_id': payload['transactionId'],
            'amount': payload['amount'],  # in paise
            'expire_at': payload.get('expireAt'),  # epoch milliseconds
            'timestamp': payload.get('timestamp'),  # epoch milliseconds
            # Include raw payload for debugging (optional)
            '_raw': payload  
        }
        
    except KeyError as e:
        logger.error(f"Missing required field in webhook: {str(e)}")
        return False, None
    except Exception as e:
        logger.error(f"Webhook verification failed: {str(e)}", exc_info=True)
        return False, None