import QuickStatCard from "./QuickStatCard";

const QuickStatsBar = () => {
  return (
    <section className="grid grid-cols-2 md:grid-cols-6 gap-4 pb-5">

      <QuickStatCard label="Total" value={ 30 }/>
      <QuickStatCard label="Teaching" value={ 15 }/>
      <QuickStatCard label="Non-Teaching" value={ 15 }/>
      <QuickStatCard label="Regular" value={ 10 }/>
      <QuickStatCard label="Probationary" value={ 18 }/>
      <QuickStatCard label="Contractual" value={ 2 }/>
      
    </section>
  );
}

export default QuickStatsBar;