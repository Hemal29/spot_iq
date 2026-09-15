import math

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

# Column layout with generous spacing
cols = [
    (200, [
        ("Customer", 120),
        ("Vehicle", 260),
        ("VehicleType", 400),
        ("Review", 540),
        ("SupportTicket", 680),
    ]),
    (520, [
        ("Notification", 140),
        ("NotificationType", 280),
        ("ParkingImage", 440),
        ("SlotImage", 580),
    ]),
    (840, [
        ("ParkingOwner", 120),
        ("Parking", 270),
        ("ParkingSlot", 420),
        ("SlotType", 560),
        ("ParkingZone", 700),
        ("Amenity", 850),
        ("ParkingAmenity", 990),
    ]),
    (1160, [
        ("Pricing", 270),
        ("Availability", 420),
        ("Reports", 730),
    ]),
    (1480, [
        ("Booking", 120),
        ("Payment", 280),
        ("PaymentMethod", 420),
        ("Transaction", 560),
        ("Invoice", 700),
        ("Coupon", 850),
    ]),
    (1780, [
        ("Admin", 120),
        ("Role", 280),
        ("Permission", 440),
    ]),
]

POS = {}
for cx, items in cols:
    for name, cy in items:
        POS[name] = (cx, cy)

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

EO_W, EO_H = 180, 60
AO_W, AO_H = 110, 28
# Diamond
DW, DH = 80, 44

def esc(s):
    return s.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")

lines = []
lines.append('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2100 1200" width="100%" height="100%" style="background:#F8FAFC;font-family:Arial,sans-serif;">')
lines.append(f'<rect width="2100" height="1200" fill="#F8FAFC"/>')
lines.append(f'<text x="1050" y="38" text-anchor="middle" font-size="26" font-weight="bold" fill="#0F172A">SpotIQ — Chen-Style ER Diagram</text>')
lines.append(f'<text x="1050" y="65" text-anchor="middle" font-size="14" fill="#64748B">Blue Ovals = Entities &nbsp;|&nbsp; Green Ovals = Attributes &nbsp;|&nbsp; Black Diamonds = Relationships &nbsp;|&nbsp; Orange = Cardinality &nbsp;|&nbsp; Underlined = Primary Key</text>')

def edge_pt(ex, ey, tdx, tdy, rx, ry):
    angle = math.atan2(tdy - ey, tdx - ex)
    cos_a = math.cos(angle)
    sin_a = math.sin(angle)
    denom = math.sqrt((cos_a/rx)**2 + (sin_a/ry)**2)
    if denom < 0.001:
        return ex, ey
    t = 1.0 / denom
    return ex + cos_a * t, ey + sin_a * t

def entity_edge(en, tdx, tdy):
    cx, cy = POS[en]
    return edge_pt(cx, cy, tdx, tdy, EO_W//2, EO_H//2)

for f, t, label, c1, c2 in REL:
    if f not in POS or t not in POS:
        continue
    fx, fy = POS[f]
    tx, ty = POS[t]
    dx, dy = (fx + tx)//2, (fy + ty)//2
    
    ex1, ey1 = entity_edge(f, dx, dy)
    ex2, ey2 = entity_edge(t, dx, dy)
    
    lines.append(f'<line x1="{ex1:.0f}" y1="{ey1:.0f}" x2="{dx}" y2="{dy}" stroke="#64748B" stroke-width="2"/>')
    lines.append(f'<line x1="{dx}" y1="{dy}" x2="{ex2:.0f}" y2="{ey2:.0f}" stroke="#64748B" stroke-width="2"/>')
    
    pts = f"{dx},{dy-DH//2} {dx+DW//2},{dy} {dx},{dy+DH//2} {dx-DW//2},{dy}"
    lines.append(f'<polygon points="{pts}" fill="#1E293B" stroke="#0F172A" stroke-width="2"/>')
    lines.append(f'<text x="{dx}" y="{dy+5}" text-anchor="middle" font-size="10" fill="#FFF" font-weight="bold">{esc(label)}</text>')
    
    # Cardinality labels
    lx1, ly1 = (ex1 + dx)/2, (ey1 + dy)/2 - 16
    lx2, ly2 = (ex2 + dx)/2, (ey2 + dy)/2 - 16
    lines.append(f'<text x="{lx1:.0f}" y="{ly1:.0f}" text-anchor="middle" font-size="14" fill="#F97316" font-weight="bold">{esc(c1)}</text>')
    lines.append(f'<text x="{lx2:.0f}" y="{ly2:.0f}" text-anchor="middle" font-size="14" fill="#F97316" font-weight="bold">{esc(c2)}</text>')

for ename, attrs in entities.items():
    if ename not in POS:
        continue
    cx, cy = POS[ename]
    
    # Entity oval
    lines.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{EO_W//2}" ry="{EO_H//2}" fill="#2563EB" stroke="#1E40AF" stroke-width="2.5"/>')
    lines.append(f'<text x="{cx}" y="{cy+5}" text-anchor="middle" font-size="15" font-weight="bold" fill="#FFF">{esc(ename)}</text>')
    
    n = len(attrs)
    for i, attr in enumerate(attrs):
        side = -1 if i % 2 == 0 else 1
        row = i // 2
        
        ax = cx + side * (EO_W//2 + 75)
        # Space attributes with offset
        spacing = 32
        start_y = cy - ((n-1)//2) * spacing//2
        ay = start_y + row * spacing - 10 * (i % 2)
        
        # Attribute oval
        lines.append(f'<ellipse cx="{ax}" cy="{ay}" rx="{AO_W//2}" ry="{AO_H//2}" fill="#22C55E" stroke="#16A34A" stroke-width="2"/>')
        
        disp = f'<u>{attr}</u>' if i == 0 else attr
        txt_dec = 'text-decoration="underline"' if i == 0 else ''
        lines.append(f'<text x="{ax}" y="{ay+4}" text-anchor="middle" font-size="10" fill="#FFF" font-weight="bold" {txt_dec}>{esc(attr)}</text>')
        
        # Line from entity edge to attribute edge
        ex = cx + side * (EO_W//2 - 5)
        lx = ax - side * (AO_W//2 - 5)
        lines.append(f'<line x1="{ex}" y1="{cy}" x2="{lx}" y2="{ay}" stroke="#94A3B8" stroke-width="1.2"/>')

# Legend
lx, ly = 1850, 1050
lines.append(f'<rect x="{lx}" y="{ly}" width="200" height="110" rx="8" fill="#FFF" stroke="#CBD5E1" stroke-width="1"/>')
lines.append(f'<text x="{lx+10}" y="{ly+22}" font-size="13" font-weight="bold" fill="#0F172A">Legend</text>')
lines.append(f'<ellipse cx="{lx+20}" cy="{ly+45}" rx="12" ry="8" fill="#2563EB"/>')
lines.append(f'<text x="{lx+40}" y="{ly+49}" font-size="11" fill="#475569">Entity</text>')
lines.append(f'<ellipse cx="{lx+20}" cy="{ly+70}" rx="12" ry="8" fill="#22C55E"/>')
lines.append(f'<text x="{lx+40}" y="{ly+74}" font-size="11" fill="#475569">Attribute (PK underlined)</text>')
lines.append(f'<polygon points="{lx+12},{ly+90} {lx+28},{ly+90} {lx+20},{ly+100}" fill="#1E293B"/>')
lines.append(f'<text x="{lx+40}" y="{ly+98}" font-size="11" fill="#475569">Relationship</text>')

lines.append('</svg>')
svg = '\n'.join(lines)

with open('/Users/hemal/OpenMind/SpotIQ/SpotIQ_ER_Oval.html', 'w') as f:
    f.write(f'<!DOCTYPE html><html><body style="margin:0;padding:0;">{svg}</body></html>')
print(f"Saved: {len(svg)} bytes")
