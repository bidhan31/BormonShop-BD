interface OrderTrackingStepperProps {
  currentStatus: string;
}

const STEPS = ["Pending", "Confirmed", "Processing", "Shipped", "Out for Delivery", "Delivered"];

export default function OrderTrackingStepper({ currentStatus }: OrderTrackingStepperProps) {
  const isCancelled = currentStatus === "Cancelled";
  const currentIndex = STEPS.indexOf(currentStatus);

  if (isCancelled) {
    return (
      <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg px-4 py-3 text-center">
        This order has been cancelled.
      </div>
    );
  }

  return (
    <div className="flex items-center w-full overflow-x-auto py-2" aria-label="Order tracking progress">
      {STEPS.map((step, idx) => {
        const isComplete = idx <= currentIndex;
        const isLast = idx === STEPS.length - 1;

        return (
          <div key={step} className="flex items-center flex-1 min-w-[90px]">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                  isComplete ? "bg-accent text-accent-foreground" : "bg-secondary border border-border text-muted"
                }`}
              >
                {isComplete ? "✓" : idx + 1}
              </div>
              <span className={`text-[11px] mt-2 text-center ${isComplete ? "text-ink" : "text-muted"}`}>
                {step}
              </span>
            </div>

            {!isLast && (
              <div className={`h-0.5 flex-1 -mt-5 ${idx < currentIndex ? "bg-accent" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
