import {
  ArrowRight,
  Boxes,
  Building2,
  ClipboardList,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    icon: Boxes,
    title: "Material Supply",
    description:
      "Coordinated material supply for large-scale infrastructure projects.",
  },
  {
    icon: ClipboardList,
    title: "Project Procurement",
    description:
      "Structured procurement based on project requirements and priorities.",
  },
  {
    icon: Building2,
    title: "Inventory Management",
    description:
      "Centralized visibility of materials, stock levels and availability.",
  },
  {
    icon: Truck,
    title: "Dispatch & Delivery",
    description:
      "Track material dispatches and delivery progress from source to site.",
  },
];

const sectors = [
  "Solar Projects",
  "Hydro Projects",
  "Dam Projects",
  "Infrastructure Projects",
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top accent */}
      <div className="h-1 bg-primary" />

      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Logo */}
          <div>
            <div className="text-lg font-bold tracking-tight text-foreground">
              S.B.A.
            </div>
            <div className="text-[11px] font-medium tracking-wide text-muted-foreground">
              SHREE BALAJI ASSOCIATES
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a
              href="#services"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              Services
            </a>

            <a
              href="#sectors"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              Project Sectors
            </a>

            <a
              href="#about"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              About
            </a>
          </nav>

          {/* Portal button */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Project Portal
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="border-b">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-28">
            {/* Hero content */}
            <div>
              <div className="mb-5 inline-flex items-center rounded-md border bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground">
                Infrastructure Project Supply Management
              </div>

              <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Material & Supply Management for{" "}
                <span className="text-primary">Infrastructure Projects</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
                Coordinating project requirements, material procurement,
                inventory and delivery through a centralized project supply
                management platform.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Access Project Portal
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <a
                  href="#services"
                  className="inline-flex items-center rounded-md border bg-white px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                >
                  Explore Services
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <span>✓ Project Coordination</span>
                <span>✓ Material Management</span>
                <span>✓ Supply Tracking</span>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative">
              <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                <div className="border-b bg-muted/40 px-5 py-4">
                  <div className="text-xs font-medium text-muted-foreground">
                    PROJECT OPERATIONS
                  </div>
                  <div className="mt-1 text-lg font-semibold">
                    Supply Management Overview
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-px bg-border">
                  <div className="bg-white p-5">
                    <p className="text-xs text-muted-foreground">Projects</p>
                    <p className="mt-2 text-2xl font-semibold">01</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Under management
                    </p>
                  </div>

                  <div className="bg-white p-5">
                    <p className="text-xs text-muted-foreground">Materials</p>
                    <p className="mt-2 text-2xl font-semibold">06</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      In inventory
                    </p>
                  </div>

                  <div className="bg-white p-5">
                    <p className="text-xs text-muted-foreground">Suppliers</p>
                    <p className="mt-2 text-2xl font-semibold">02</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Active suppliers
                    </p>
                  </div>

                  <div className="bg-white p-5">
                    <p className="text-xs text-muted-foreground">Dispatches</p>
                    <p className="mt-2 text-2xl font-semibold">01</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Confirmed delivery
                    </p>
                  </div>
                </div>

                <div className="border-t px-5 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      System Status
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700">
                      <span className="h-2 w-2 rounded-full bg-green-600" />
                      Operational
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Our Services
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Supporting project execution from supply to site
              </h2>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                A structured approach to managing materials, procurement,
                inventory and delivery across project operations.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((service) => {
                const Icon = service.icon;

                return (
                  <div
                    key={service.title}
                    className="rounded-lg border bg-background p-5 transition-colors hover:border-primary/40"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="mt-4 text-sm font-semibold">
                      {service.title}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      {service.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Sectors */}
        <section id="sectors" className="border-b">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Project Sectors
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Supporting diverse infrastructure projects
                </h2>
              </div>

              <p className="max-w-md text-sm leading-6 text-muted-foreground">
                The platform is designed to support material and supply
                operations across different types of infrastructure projects.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {sectors.map((sector, index) => (
                <div
                  key={sector}
                  className="flex items-center gap-3 rounded-lg border bg-white px-4 py-4"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                    0{index + 1}
                  </span>

                  <span className="text-sm font-medium">{sector}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About / CTA */}
        <section id="about" className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
            <div className="rounded-xl border bg-background p-8 md:p-10">
              <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Shree Balaji Associates
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                    A centralized platform for project supply operations
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Manage project requirements, inventory, supplier orders and
                    material dispatches through one organized system.
                  </p>
                </div>

                <Link
                  to="/login"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Access Portal
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            © {new Date().getFullYear()} Shree Balaji Associates
          </div>

          <div>Project Material & Supply Management System</div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;