# app/logic/predictor.py
import time

class SavingsPredictor:
    def __init__(self):
        self.TARIFF_RATE_INR = 8.0  # ₹8 per kWh
        self.FAN_WATTS = 75.0
        self.LIGHT_WATTS = 40.0
        self.waste_start_time = None
        self.total_seconds_saved = 0.0
        self.start_date = time.time()

    def update_savings(self, waste_detected, fan_count, light_count):
        ## Calculating savings each frame based on the current state
        current_time = time.time()

        if waste_detected:
            if self.waste_start_time is None:
                self.waste_start_time = current_time 
            else:
                elapsed = current_time - self.waste_start_time
                self.total_seconds_saved += elapsed
                self.waste_start_time = current_time
        else:
            self.waste_start_time = None 

        return self.calculate_projections(fan_count, light_count)

    def calculate_projections(self, fan_count, light_count):
        hours_running = max((time.time() - self.start_date) / 3600.0, 0.001)
        hours_saved = self.total_seconds_saved / 3600.0

        active_watts_saved = (fan_count * self.FAN_WATTS) + (light_count * self.LIGHT_WATTS)
        
        # Calculate actual kWh and INR saved so far
        kwh_saved = (active_watts_saved * hours_saved) / 1000.0
        inr_saved_actual = kwh_saved * self.TARIFF_RATE_INR

        hourly_savings_rate = inr_saved_actual / hours_running
        
        predicted_weekly_savings = hourly_savings_rate * 24 * 7
        predicted_monthly_savings = hourly_savings_rate * 24 * 30
        predicted_co2_reduction_kg = kwh_saved * 0.82 # Approx 0.82kg CO2 per kWh in India

        return {
            "actual_saved_inr": round(inr_saved_actual, 2),
            "predicted_weekly_inr": round(predicted_weekly_savings, 2),
            "predicted_monthly_inr": round(predicted_monthly_savings, 2),
            "co2_prevented_kg": round(predicted_co2_reduction_kg, 3)
        }