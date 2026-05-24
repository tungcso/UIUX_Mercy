import Sidebar from "./_components/Sidebar";
import Header from "./_components/Header";
import StatChart from "./_components/StatChart";
import PieCard from "./_components/PieCard";
import DoctorsTable from "./_components/DoctorsTable";

export default function ManagerPage() {
  return (
    <div className="min-h-screen bg-[#f8fbff] text-slate-900">
      <div className="flex min-h-screen flex-col xl:flex-row">
        <Sidebar />

        <main className="flex-1 overflow-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl">
            <Header />

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <section className="rounded-[1.65rem] border border-slate-200/80 bg-white px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
                <StatChart />
              </section>

              <aside className="rounded-[1.65rem] border border-slate-200/80 bg-white px-5 py-5 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
                <PieCard />
              </aside>
            </div>

            <section className="mt-6 rounded-[1.65rem] border border-slate-200/80 bg-white px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
              <DoctorsTable />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
