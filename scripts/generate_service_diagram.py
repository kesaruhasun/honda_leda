import os
import re

print("classDiagram")

# A more robust regex for java method signatures
pattern = re.compile(r"^\s*public\s+([\w<>,\s\[\]]+)\s+(\w+)\s*\(([^)]*)\)", re.MULTILINE)

services = [
    "AppointmentService", "BillingService", "DoctorService", 
    "LaboratoryService", "PatientService", "PharmacyService"
]

for service in services:
    print(f"\nclass {service} {{")
    filepath = f"src/main/java/com/pulseos/service/{service}.java"
    with open(filepath, "r") as f:
        content = f.read()
        for match in pattern.finditer(content):
            ret_type = match.group(1).strip()
            method_name = match.group(2).strip()
            args = match.group(3).strip().replace('\n', ' ')
            args = re.sub(r'\s+', ' ', args) # normalize spaces
            if method_name == service:
                continue # skip constructors
            
            # Format arguments to prevent mermaid parse errors (no weird characters in method signature)
            # Mermaid methods usually just have simple parameters
            # Actually, standard UML syntax: +methodName(arg1: Type, arg2: Type) : ReturnType
            # Java is Type arg1, Type arg2. Let's just output the Java signature roughly.
            # To be safe from Mermaid parser, replace `<` and `>` with `~`
            ret_type_safe = ret_type.replace("<", "~").replace(">", "~")
            args_safe = args.replace("<", "~").replace(">", "~")
            
            print(f"  +{method_name}({args_safe}) {ret_type_safe}")
    print("}")

print("\n")
print("AppointmentController --> AppointmentService")
print("BillingController --> BillingService")
print("DoctorController --> DoctorService")
print("LaboratoryController --> LaboratoryService")
print("PatientController --> PatientService")
print("PharmacyController --> PharmacyService")

