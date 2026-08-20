# Diagram Generation Prompt

If you need to generate the System Overview Diagram quickly, you can use **Mermaid JS**. Go to [mermaid.live](https://mermaid.live) and paste the following code to instantly generate a professional diagram that you can download as a PNG for your slides and report.

```mermaid
flowchart TD
    %% Users
    subgraph Users [Stakeholders]
        A1[System Admin]
        A2[Doctors]
        A3[Receptionists]
        A4[Pharmacists]
        A5[Lab Techs]
        A6[Patients]
    end

    %% Frontend
    subgraph Frontend [Web Application Client]
        UI[User Interface & Dashboards]
        AuthUI[Login / Role Check]
        UI <--> AuthUI
    end

    %% Backend Modules
    subgraph Backend [Java Backend API]
        M1[Patient Management]
        M2[Doctor Management]
        M3[Appointment Management]
        M4[Inventory & Pharmacy]
        M5[Billing & Payment]
        M6[Laboratory & Tests]
    end

    %% Database
    subgraph Storage [Database Layer]
        DB[(Relational Database)]
    end

    %% Relationships
    Users -->|Interacts with| Frontend
    AuthUI -->|Secures| Backend
    
    Frontend <--> M1
    Frontend <--> M2
    Frontend <--> M3
    Frontend <--> M4
    Frontend <--> M5
    Frontend <--> M6
    
    M1 <--> DB
    M2 <--> DB
    M3 <--> DB
    M4 <--> DB
    M5 <--> DB
    M6 <--> DB

    %% Styling
    classDef primary fill:#e1f5fe,stroke:#0288d1,stroke-width:2px;
    classDef secondary fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;
    classDef database fill:#e8f5e9,stroke:#388e3c,stroke-width:2px;
    
    class A1,A2,A3,A4,A5,A6 secondary;
    class UI,AuthUI primary;
    class DB database;
```
