
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';

export function Income() {
  const totalIncome = 5000;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income</CardTitle>
        <CardDescription>Your total income this month.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Total Income:</span>
            <span>${totalIncome}</span>
          </div>
          {/* Add more detailed income sources here */}
        </div>
      </CardContent>
    </Card>
  );
}
