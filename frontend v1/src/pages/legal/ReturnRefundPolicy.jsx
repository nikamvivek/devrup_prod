import React from "react";

const ReturnRefundPolicy = () => {
  return (
    <div className="bg-gradient-to-b from-white to-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-8">
            Return & Refund Policy
          </h1>

          <div className="space-y-6 text-gray-700 leading-relaxed text-sm sm:text-base whitespace-pre-line">
{`Return Policy
We offer Return within the first 7 day from the date of your purchase. If 7 days have passed since your purchase, you will not be offered a return

Refund Policy
In case of any refunds approved by the company, it will take 7 days for the refund to be credited to your original payment method.`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnRefundPolicy;
