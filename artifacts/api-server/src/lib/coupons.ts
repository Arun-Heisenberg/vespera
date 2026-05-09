import { db, couponsTable, couponRedemptionsTable, ordersTable } from "@workspace/db";
import { eq, and, count } from "drizzle-orm";

export interface CouponEvalInput {
  code: string;
  customerId: number | null;
  subtotal: number;
}

export interface CouponEvalResult {
  ok: boolean;
  error?: string;
  couponId?: number;
  code?: string;
  discountAmount?: number;
  description?: string;
}

export async function evaluateCoupon(input: CouponEvalInput): Promise<CouponEvalResult> {
  const code = input.code.trim().toUpperCase();
  if (!code) return { ok: false, error: "Coupon code required" };

  const [coupon] = await db.select().from(couponsTable).where(eq(couponsTable.code, code)).limit(1);
  if (!coupon || !coupon.isActive) return { ok: false, error: "Invalid coupon code" };

  const now = new Date();
  if (coupon.validFrom && coupon.validFrom > now) return { ok: false, error: "Coupon not yet active" };
  if (coupon.validUntil && coupon.validUntil < now) return { ok: false, error: "Coupon has expired" };

  if (input.subtotal < parseFloat(coupon.minOrderAmount)) {
    return { ok: false, error: `Minimum order ₹${coupon.minOrderAmount} required` };
  }

  if (coupon.usageLimit) {
    const [{ value: used }] = await db
      .select({ value: count() })
      .from(couponRedemptionsTable)
      .where(eq(couponRedemptionsTable.couponId, coupon.id));
    if (Number(used) >= coupon.usageLimit) return { ok: false, error: "Coupon usage limit reached" };
  }

  if (input.customerId) {
    if (coupon.firstOrderOnly) {
      const [{ value: orderCount }] = await db
        .select({ value: count() })
        .from(ordersTable)
        .where(and(eq(ordersTable.customerId, input.customerId), eq(ordersTable.paymentStatus, "paid")));
      if (Number(orderCount) > 0) return { ok: false, error: "Coupon valid for first order only" };
    }
    if (coupon.perCustomerLimit) {
      const [{ value: usedByCustomer }] = await db
        .select({ value: count() })
        .from(couponRedemptionsTable)
        .where(and(eq(couponRedemptionsTable.couponId, coupon.id), eq(couponRedemptionsTable.customerId, input.customerId)));
      if (Number(usedByCustomer) >= coupon.perCustomerLimit) {
        return { ok: false, error: "You have already used this coupon" };
      }
    }
  }

  let discount = 0;
  if (coupon.discountType === "percent") {
    discount = (input.subtotal * parseFloat(coupon.discountValue)) / 100;
  } else {
    discount = parseFloat(coupon.discountValue);
  }
  if (coupon.maxDiscountAmount) {
    discount = Math.min(discount, parseFloat(coupon.maxDiscountAmount));
  }
  discount = Math.min(discount, input.subtotal);
  discount = Math.round(discount * 100) / 100;

  return { ok: true, couponId: coupon.id, code: coupon.code, discountAmount: discount, description: coupon.description };
}
