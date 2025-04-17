
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Progress} from '@/components/ui/progress';

export function Budget() {
  const budget = 5000;
  const spent = 3500;
  const remaining = budget - spent;
  const percentageSpent = (spent / budget) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget</CardTitle>
        <CardDescription>Track your spending against your budget.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Budget:</span>
            <span>${budget}</span>
          </div>
          <div className="flex justify-between">
            <span>Spent:</span>
            <span>${spent}</span>
          </div>
          <div className="flex justify-between">
            <span>Remaining:</span>
            <span>${remaining}</span>
          </div>
          <Progress value={percentageSpent} />
        </div>
      </CardContent>
    </Card>
  );
}
