flowchart TD
    A[User visits app] --> B[Show Login Form]
    B --> C{Credentials valid}
    C -->|No| D[Show Error]
    D --> B
    C -->|Yes| E{Determine Role}
    E -->|Cashier| F[POS Screen]
    E -->|Manager| G[Stock Management]
    E -->|Owner| H[Reporting Dashboard]
    F --> I[Process Sale]
    I --> J{Sale successful}
    J -->|Yes| K[Print Receipt]
    K --> L[Update Sales Dashboard]
    L --> F
    J -->|No| M[Show Error]
    M --> F
    G --> N[Perform Stock Opname]
    N --> O[Update Inventory]
    O --> G
    H --> P[Select Report Type]
    P --> Q[Generate Report]
    Q --> R[Display Report]
    R --> H