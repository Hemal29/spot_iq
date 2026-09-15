import math, os

# ─── DATA ───
entities = {
    "Customer": ["customer_id", "full_name", "email", "phone", "password", "profile_image", "created_at", "status"],
    "Admin": ["admin_id", "full_name", "email", "password", "role", "last_login", "created_at"],
    "ParkingOwner": ["owner_id", "full_name", "email", "phone", "password", "business_name", "verification_status", "created_at"],
    "Vehicle": ["vehicle_id", "customer_id", "vehicle_number", "vehicle_type_id", "model", "color", "manufacturer", "year"],
    "VehicleType": ["vehicle_type_id", "type_name", "icon", "slot_size_required"],
    "Parking": ["parking_id", "owner_id", "parking_name", "address", "city", "latitude", "longitude", "total_slots", "price_per_hour", "status"],
    "ParkingSlot": ["slot_id", "parking_id", "slot_number", "slot_type_id", "floor", "availability", "status"],
    "SlotType": ["slot_type_id", "type_name", "description", "base_price"],
    "ParkingZone": ["zone_id", "parking_id", "zone_name", "capacity", "rate_multiplier"],
    "Booking": ["booking_id", "customer_id", "slot_id", "vehicle_id", "coupon_id", "booking_date", "start_time", "end_time", "total_amount", "booking_status"],
    "Payment": ["payment_id", "booking_id", "payment_method_id", "amount", "payment_status", "transaction_id", "payment_date"],
    "Transaction": ["transaction_id", "payment_id", "gateway_ref", "amount", "status", "initiated_at", "completed_at"],
    "Invoice": ["invoice_id", "transaction_id", "invoice_number", "amount", "tax", "total", "generated_at", "due_date"],
    "Coupon": ["coupon_id", "coupon_code", "discount_type", "discount_value", "min_amount", "max_discount", "expiry_date", "status", "usage_limit"],
    "Review": ["review_id", "customer_id", "parking_id", "rating", "review", "created_at", "updated_at"],
    "Notification": ["notification_id", "customer_id", "notification_type_id", "title", "message", "is_read", "created_at"],
    "NotificationType": ["notification_type_id", "type_name", "template", "is_push", "is_email"],
    "SupportTicket": ["ticket_id", "customer_id", "subject", "description", "status", "priority", "assigned_to", "created_at", "resolved_at"],
    "Role": ["role_id", "role_name", "description", "is_system"],
    "Permission": ["permission_id", "permission_name", "resource", "action", "description"],
    "Amenity": ["amenity_id", "amenity_name", "icon", "description"],
    "ParkingAmenity": ["parking_amenity_id", "parking_id", "amenity_id", "is_free", "charge"],
    "Pricing": ["pricing_id", "parking_id", "slot_type_id", "base_price", "peak_price", "night_price", "weekend_price"],
    "Availability": ["availability_id", "parking_id", "date", "available_slots", "is_holiday"],
    "Reports": ["report_id", "generated_by", "report_type", "data", "created_at"],
    "PaymentMethod": ["payment_method_id", "method_name", "provider", "is_active"],
    "ParkingImage": ["image_id", "parking_id", "image_url", "caption", "is_primary", "uploaded_at"],
    "SlotImage": ["image_id", "slot_id", "image_url", "caption", "uploaded_at"],
}

ENames = list(entities.keys())

# Positions (x,y) for entity ovals - center coordinates
POS = {}
cols = [
    (150, ["Customer", "Vehicle", "VehicleType", "Review"]),
    (400, ["Notification", "NotificationType", "SupportTicket", "ParkingImage", "SlotImage"]),
    (650, ["ParkingOwner", "Parking", "ParkingSlot", "SlotType", "ParkingZone", "Amenity", "ParkingAmenity"]),
    (900, ["Pricing", "Availability", "Reports"]),
    (1150, ["Booking", "Payment", "PaymentMethod", "Transaction", "Invoice", "Coupon"]),
    (1400, ["Admin", "Role", "Permission"]),
]
for cx, names in cols:
    y_start = 80
    y_gap = 130
    for i, name in enumerate(names):
        POS[name] = (cx, y_start + i * y_gap)

# Adjust some Y positions
POS["Notification"] = (400, 80)
POS["NotificationType"] = (400, 200)
POS["SupportTicket"] = (400, 340)
POS["ParkingImage"] = (400, 480)
POS["SlotImage"] = (400, 610)
POS["ParkingOwner"] = (650, 80)
POS["Parking"] = (650, 210)
POS["ParkingSlot"] = (650, 340)
POS["SlotType"] = (650, 470)
POS["ParkingZone"] = (650, 600)
POS["Amenity"] = (650, 740)
POS["ParkingAmenity"] = (650, 870)
POS["Pricing"] = (900, 210)
POS["Availability"] = (900, 340)
POS["Reports"] = (1400, 470)
POS["Admin"] = (1400, 80)
POS["Role"] = (1400, 210)
POS["Permission"] = (1400, 350)

# Entity oval sizes
EO_W = 160  # width
EO_H = 50   # height

# Attribute oval sizes  
AO_W = 100
AO_H = 26

REL = [
    ("Customer", "Vehicle", "owns", "1", "N"),
    ("Vehicle", "VehicleType", "belongs_to", "N", "1"),
    ("Customer", "Booking", "makes", "1", "N"),
    ("Booking", "ParkingSlot", "reserves", "N", "1"),
    ("Booking", "Payment", "generates", "1", "1"),
    ("Payment", "PaymentMethod", "uses", "N", "1"),
    ("Payment", "Transaction", "creates", "1", "1"),
    ("Transaction", "Invoice", "generates", "1", "1"),
    ("Booking", "Coupon", "uses", "N", "1"),
    ("Customer", "Review", "writes", "1", "N"),
    ("Review", "Parking", "for", "N", "1"),
    ("ParkingOwner", "Parking", "manages", "1", "N"),
    ("Parking", "ParkingSlot", "contains", "1", "N"),
    ("ParkingSlot", "SlotType", "belongs_to", "N", "1"),
    ("Parking", "ParkingZone", "has", "1", "N"),
    ("Parking", "ParkingImage", "has", "1", "N"),
    ("ParkingSlot", "SlotImage", "has", "1", "N"),
    ("Parking", "Amenity", "offers", "N", "M"),
    ("Parking", "ParkingAmenity", "has", "1", "N"),
    ("ParkingAmenity", "Amenity", "of_type", "N", "1"),
    ("Parking", "Pricing", "has", "1", "N"),
    ("Parking", "Availability", "has", "1", "N"),
    ("Customer", "Notification", "receives", "1", "N"),
    ("Notification", "NotificationType", "sent_via", "N", "1"),
    ("Customer", "SupportTicket", "creates", "1", "N"),
    ("Admin", "Role", "assigned_to", "N", "1"),
    ("Role", "Permission", "has", "N", "M"),
    ("Admin", "Reports", "generates", "1", "N"),
    ("Admin", "Parking", "manages", "N", "N"),
    ("Admin", "Booking", "oversees", "N", "N"),
    ("Admin", "Customer", "administers", "N", "N"),
    ("Admin", "Coupon", "manages", "1", "N"),
    ("Admin", "ParkingOwner", "verifies", "1", "N"),
]

def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def build_svg():
    lines = []
    lines.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1700 1100" width="1700" height="1100">')
    lines.append(f'<rect width="1700" height="1100" fill="#F8FAFC"/>')
    lines.append(f'<text x="850" y="30" text-anchor="middle" font-size="22" font-weight="bold" fill="#1E293B" font-family="Arial,sans-serif">SpotIQ — Chen-Style ER Diagram (Oval Entities)</text>')

    # Draw relationships first (behind entities)
    for f, t, label, c1, c2 in REL:
        if f not in POS or t not in POS:
            continue
        fx, fy = POS[f]
        tx, ty = POS[t]
        # Diamond at midpoint
        dx, dy = (fx + tx) // 2, (fy + ty) // 2
        # Draw line from entity edge to diamond
        # Calculate edge points
        def edge_point(ex, ey, dx, dy):
            # Point on oval edge toward (dx, dy)
            angle = math.atan2(dy - ey, dx - ex)
            # For oval, rx=EO_W/2, ry=EO_H/2
            rx = EO_W // 2
            ry = EO_H // 2
            # Parametric equation for ellipse
            # Find t where line from center intersects ellipse
            # Solve: (rx*cos(t))^2/rx^2 + (ry*sin(t))^2/ry^2 = 1
            # Actually: point on ellipse in direction of angle
            cos_a = math.cos(angle)
            sin_a = math.sin(angle)
            # Handle near-zero
            denom = math.sqrt((cos_a/rx)**2 + (sin_a/ry)**2)
            if denom < 0.001:
                return ex, ey
            t_val = 1.0 / denom
            px = ex + cos_a * t_val
            py = ey + sin_a * t_val
            return px, py

        ex1, ey1 = edge_point(fx, fy, dx, dy)
        ex2, ey2 = edge_point(tx, ty, dx, dy)
        
        # Draw line from entity1 to diamond
        lines.append(f'<line x1="{ex1:.0f}" y1="{ey1:.0f}" x2="{dx}" y2="{dy}" stroke="#475569" stroke-width="1.5"/>')
        # Draw line from diamond to entity2
        lines.append(f'<line x1="{dx}" y1="{dy}" x2="{ex2:.0f}" y2="{ey2:.0f}" stroke="#475569" stroke-width="1.5"/>')
        
        # Diamond (relationship)
        dw, dh = 80, 40
        pts = f"{dx},{dy-dh//2} {dx+dw//2},{dy} {dx},{dy+dh//2} {dx-dw//2},{dy}"
        lines.append(f'<polygon points="{pts}" fill="#1E293B" stroke="#0F172A" stroke-width="1"/>')
        lines.append(f'<text x="{dx}" y="{dy+4}" text-anchor="middle" font-size="9" fill="#FFF" font-weight="bold" font-family="Arial,sans-serif">{esc(label)}</text>')
        
        # Cardinality labels
        lx1 = (fx + dx) // 2
        ly1 = (fy + dy) // 2 - 12
        lx2 = (tx + dx) // 2
        ly2 = (ty + dy) // 2 - 12
        lines.append(f'<text x="{lx1}" y="{ly1}" text-anchor="middle" font-size="11" fill="#F97316" font-weight="bold" font-family="Arial,sans-serif">{esc(c1)}</text>')
        lines.append(f'<text x="{lx2}" y="{ly2}" text-anchor="middle" font-size="11" fill="#F97316" font-weight="bold" font-family="Arial,sans-serif">{esc(c2)}</text>')

    # Draw entity ovals and their attribute ovals
    for ename, attrs in entities.items():
        if ename not in POS:
            continue
        cx, cy = POS[ename]
        
        # Entity oval
        lines.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{EO_W//2}" ry="{EO_H//2}" fill="#2563EB" stroke="#1E40AF" stroke-width="2"/>')
        lines.append(f'<text x="{cx}" y="{cy+4}" text-anchor="middle" font-size="12" font-weight="bold" fill="#FFF" font-family="Arial,sans-serif">{esc(ename)}</text>')
        
        # Attribute ovals arranged around the entity
        n = len(attrs)
        # Place attributes in a circle around entity
        # For up to 10 attrs, use 2 columns
        # Left column even indices, right column odd indices
        for i, attr in enumerate(attrs):
            # Alternate left/right
            side = -1 if i % 2 == 0 else 1
            row = i // 2
            
            ax = cx + side * (EO_W // 2 + 60)
            ay = cy - (n // 2) * 15 + row * 32 + 15 * (i % 2)
            
            # Attribute oval
            lines.append(f'<ellipse cx="{ax}" cy="{ay}" rx="{AO_W//2}" ry="{AO_H//2}" fill="#22C55E" stroke="#16A34A" stroke-width="1.5"/>')
            
            if i == 0:
                display = attr  # PK
                lines.append(f'<text x="{ax}" y="{ay+3}" text-anchor="middle" font-size="9" fill="#FFF" font-weight="bold" text-decoration="underline" font-family="Arial,sans-serif">{esc(attr)}</text>')
            else:
                lines.append(f'<text x="{ax}" y="{ay+3}" text-anchor="middle" font-size="9" fill="#FFF" font-family="Arial,sans-serif">{esc(attr)}</text>')
            
            # Line from entity to attribute
            lines.append(f'<line x1="{cx + side * (EO_W//2 - 5)}" y1="{cy}" x2="{ax - side * (AO_W//2 - 5)}" y2="{ay}" stroke="#94A3B8" stroke-width="0.8"/>')

    lines.append('</svg>')
    return '\n'.join(lines)

svg = build_svg()
with open('/Users/hemal/OpenMind/SpotIQ/SpotIQ_ER_Oval.html', 'w') as f:
    f.write(f'<!DOCTYPE html><html><body>{svg}</body></html>')
print(f"Saved: SpotIQ_ER_Oval.html ({len(svg)} bytes)")
