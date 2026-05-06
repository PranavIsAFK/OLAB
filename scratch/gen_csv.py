import os
import random

# Realistic addresses in Delhi-NCR
addresses = [
    "Connaught Place, Delhi", "Chandni Chowk, Delhi", "Hauz Khas, Delhi", "Saket, Delhi",
    "Lajpat Nagar, Delhi", "Karol Bagh, Delhi", "Rohini Sector 7, Delhi", "Dwarka Sector 10, Delhi",
    "Okhla Phase 3, Delhi", "Janakpuri, Delhi", "Vasant Kunj, Delhi", "Pitampura, Delhi",
    "Cyber Hub, Gurgaon", "Sector 29, Gurgaon", "Sector 56, Gurgaon", "Sohna Road, Gurgaon",
    "Sector 62, Noida", "Sector 18, Noida", "Sector 15, Noida", "Greater Noida, Pari Chowk",
    "Faridabad Sector 15", "Ghaziabad, Indirapuram", "Noida City Centre", "Rajouri Garden, Delhi"
]

batches = [
    ("delhi_north_express", "North Delhi Fast Delivery"),
    ("delhi_south_premium", "South Delhi Premium Route"),
    ("gurgaon_corporate", "Gurgaon Corporate Hub"),
    ("noida_tech_park", "Noida Tech Park Logistics"),
    ("east_delhi_retail", "East Delhi Retail Batch"),
    ("west_delhi_wholesale", "West Delhi Wholesale Route"),
    ("faridabad_industrial", "Faridabad Industrial Supply"),
    ("ghaziabad_residential", "Ghaziabad Residential Delivery"),
    ("dwarka_suburban", "Dwarka Suburban Circuit"),
    ("airport_cargo_route", "IGI Airport Cargo Batch")
]

os.makedirs('csv_batches', exist_ok=True)

for filename, description in batches:
    path = os.path.join('csv_batches', f"{filename}.csv")
    with open(path, 'w') as f:
        f.write("PackageID,Weight_kg,Profit_INR,Location\n")
        num_orders = random.randint(20, 25)
        for i in range(1, num_orders + 1):
            pkg_id = f"{filename[:3].upper()}-{100 + i}"
            weight = random.randint(5, 50)
            profit = weight * random.randint(20, 50)
            loc = random.choice(addresses)
            f.write(f"{pkg_id},{weight},{profit},{loc}\n")

print("10 CSV files generated in csv_batches/")
