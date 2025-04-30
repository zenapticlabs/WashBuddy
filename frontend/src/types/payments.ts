export interface PaymentHistory {
  id: number;
  payment_intent_id: string;
  amount: string;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
  carwash_name: string;
  package_name: string;
  offer_name: string;
  carwash_code: string;
  error_message: string | null;
  offer_id: number;
  package_id: number;
  car_wash_id: number;
}
