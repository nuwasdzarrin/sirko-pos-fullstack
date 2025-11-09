# Frontend Guideline Document for Sirko POS

Welcome to the frontend guide for Sirko, our modern multi-branch point-of-sale application. This document explains how the frontend is organized, which tools and design ideas we use, and why. You don’t need a deep technical background—just follow these sections to understand or join the project.

---

## 1. Frontend Architecture

Our frontend is built with **Vue 3** and organized in a clear, component-based structure:

- **Vue 3 (Composition API)**: Gives us a clean, reactive way to write components.
- **Vite**: Super-fast development server and build tool.
- **Pinia**: Manages global state (current user, selected branch, shopping cart).
- **Vue Router**: Handles page navigation and protected routes.
- **Bootstrap 5**: Provides a solid base for responsive layouts and components.

Why this setup works:

- **Scalability**: Components live in folders by feature (e.g., `components/pos`, `components/dashboard`). As we add screens or widgets, it stays organized.
- **Maintainability**: Each piece has one job—Vue files contain template, logic, and styles together. Pinia stores keep data logic separate, so it’s easy to spot where state lives.
- **Performance**: Vite’s fast rebuilds plus lazy loading of routes keep page loads snappy.

---

## 2. Design Principles

We follow these key ideas to make Sirko easy and pleasant to use:

1. **Usability**: Buttons, forms, and screens are simple and predictable. Cashiers can learn the POS screen in minutes.
2. **Accessibility**: We use semantic HTML, ARIA labels on key controls, and ensure color contrast meets standards so everyone can work comfortably.
3. **Responsiveness**: Layouts adapt from desktop to tablet to small touch-screen devices. Bootstrap’s grid and utilities help us adjust spacing, font sizes, and element stacking.
4. **Consistency**: We stick to a common set of components and style rules so every page feels part of the same app.

How these show up:

- Forms indicate errors in red under input fields.
- Buttons have consistent size, padding, and hover states.
- Tables and lists are scrollable on smaller screens.

---

## 3. Styling and Theming

### CSS Approach

- We rely on **Bootstrap 5** for base styles and grid.
- For custom tweaks, we use **SASS** (.scss files) with a simple BEM naming style: `block__element--modifier`.

### Theming

- A single SASS file (`variables.scss`) holds all colors and font settings.
- We use CSS custom properties (`--bs-primary`, etc.) so runtime theming (light/dark) is possible.

### Visual Style

- Style: **Modern Flat Design** with subtle shadows and crisp edges.
- Color Palette:
  - Primary: #2C7BE5 (blue)
  - Secondary: #6C757D (gray)
  - Success: #51D88A (green)
  - Danger:  #F14D54 (red)
  - Warning: #FFB400 (orange)
  - Info:    #17A2B8 (teal)
  - Light:   #F8F9FA (off-white)
  - Dark:    #343A40 (dark gray)
- Font: **Inter**, with fallbacks to sans-serif. It’s clean, legible, and works well at small sizes.

---

## 4. Component Structure

We use a folder layout that groups related components:

```
src/
├── components/       # Reusable UI bits
│   ├── pos/          # POS-specific widgets (scanning, cart)
│   ├── dashboard/    # Charts, tables, report widgets
│   └── common/       # Buttons, inputs, modals, tables
├── views/            # Route-level pages (Login.vue, POS.vue)
├── layouts/          # App-level shells (AuthLayout.vue, MainLayout.vue)
├── router/           # vue-router setup and guards
└── store/            # Pinia stores (userStore, cartStore)
```

Why components matter:

- **Reusability**: A `DataTable` in `common` can show sales, stock, or users just by adjusting props.
- **Isolation**: Fixing a bug in a small component rarely affects unrelated parts.
- **Clarity**: New team members quickly see where to add or find code.

---

## 5. State Management

We use **Pinia** for sharing data across components:

- **userStore**: Holds authenticated user info and role (owner, manager, cashier).
- **branchStore**: Tracks the currently selected branch.
- **cartStore**: Manages scanned products, quantities, and total in the POS flow.

Pattern:

1. Component dispatches an action, e.g., `cartStore.addItem(product)`.
2. Store updates its state.
3. Components react automatically (thanks to Vue reactivity).  

This setup ensures a smooth experience and predictable data flow.

---

## 6. Routing and Navigation

**Vue Router** powers our page navigation:

- **File-based routes** mimic our folder structure under `views/`.
- **Route Guards** check `userStore.role` and `userStore.token` before allowing access to protected pages (POS, inventory, reports).
- **Lazy Loading**: Each view is imported only when needed:
  ```js
  const POS = () => import('../views/POS.vue');
  ```

Navigation steps:

1. Unauthenticated users see `/login` or `/register`.
2. After login, we redirect based on role:
   - Cashier → `/pos`
   - Manager → `/inventory`
   - Owner → `/reports`
3. Users can switch branches if their role allows it.

---

## 7. Performance Optimization

To keep the app fast and light:

- **Code Splitting**: Routes and large components load on demand.
- **Lazy-Loaded Images**: Product photos and icons load only when in view.
- **Minified Bundles**: Vite produces small, optimized JS and CSS.
- **Caching**: Static assets (CSS, fonts) come with long cache headers.

These steps reduce initial load time and speed up navigation.

---

## 8. Testing and Quality Assurance

We ensure reliability with a three-tiered test strategy:

1. **Unit Tests (Vitest + Vue Test Utils)**
   - Test individual components (e.g., `Button.vue`) and Pinia stores.
2. **Integration Tests**
   - Combine components and stores to test flows like adding items to the cart or logging in.
3. **End-to-End Tests (Cypress or Playwright)**
   - Simulate a cashier completing a sale, a manager doing stock opname, or an owner viewing monthly reports.

We also use **Linters** (ESLint, Stylelint) and **Prettier** for consistent code style.

---

## 9. Conclusion and Frontend Summary

Sirko’s frontend is a clear, component-driven Vue 3 application. We rely on Vite for speed, Pinia for smooth state handling, and Bootstrap for responsive layouts. Our design focuses on usability, accessibility, and consistency. By following these guidelines, anyone on the team can add new features, fix bugs, or spin up their local environment with confidence. 

Together, these rules keep Sirko fast, maintainable, and enjoyable for every user—from the cashier on the checkout screen to the owner reviewing profits.