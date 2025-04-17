
import {Budget} from '@/components/budget';
import {Expenses} from '@/components/expenses';
import {Income} from '@/components/income';

export default function Dashboard() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Income />
        <Expenses />
        <Budget />
      </div>
    </div>
  );
}

