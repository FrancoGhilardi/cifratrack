-- Fix occurred_month trigger issue
-- Drop the problematic trigger and function
DROP TRIGGER IF EXISTS set_transactions_occurred_month ON transactions;
DROP FUNCTION IF EXISTS set_transactions_occurred_month() CASCADE;

-- Create a new trigger that correctly formats the occurred_month as YYYY-MM
CREATE OR REPLACE FUNCTION update_transaction_occurred_month()
RETURNS TRIGGER AS $$
BEGIN
  NEW.occurred_month := to_char(NEW.occurred_on, 'YYYY-MM');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_transaction_occurred_month
  BEFORE INSERT OR UPDATE OF occurred_on ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_transaction_occurred_month();
