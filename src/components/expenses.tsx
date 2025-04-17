
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';

export function Expenses() {
  const totalExpenses = 3500;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses</CardTitle>
        <CardDescription>Your total spending this month.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Total Expenses:</span>
            <span>${totalExpenses}</span>
          </div>
          {/* Add more detailed expense breakdown here */}
        </div>
      </CardContent>
    </Card>
  );
}
