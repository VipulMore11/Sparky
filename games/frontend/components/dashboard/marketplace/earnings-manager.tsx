"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet, 
  DollarSign, 
  TrendingUp, 
  Target, 
  Plus, 
  Minus,
  CreditCard,
  Banknote,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Edit,
  Save,
  X
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface EarningsManagerProps {
  initialBalance?: number;
  monthlyGoal?: number;
}

export function EarningsManager({ initialBalance = 0, monthlyGoal = 1000 }: EarningsManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [balance, setBalance] = useState(initialBalance);
  const [goal, setGoal] = useState(monthlyGoal);
  const [tempBalance, setTempBalance] = useState(balance.toString());
  const [tempGoal, setTempGoal] = useState(goal.toString());
  const [transactions, setTransactions] = useState([
    { id: '1', type: 'earn', amount: 150, description: 'Dataset sale - Cognitive Study', date: '2025-10-12' },
    { id: '2', type: 'earn', amount: 75, description: 'Game sale - Reaction Time Test', date: '2025-10-11' },
    { id: '3', type: 'spend', amount: 25, description: 'Marketplace fee', date: '2025-10-10' },
  ]);

  const addTransaction = (type: 'earn' | 'spend', amount: number, description: string) => {
    const newTransaction = {
      id: Date.now().toString(),
      type,
      amount,
      description,
      date: new Date().toISOString().split('T')[0]
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    
    if (type === 'earn') {
      setBalance(prev => prev + amount);
    } else {
      setBalance(prev => Math.max(0, prev - amount));
    }
  };

  const handleSave = () => {
    const newBalance = parseFloat(tempBalance) || 0;
    const newGoal = parseFloat(tempGoal) || 1000;
    
    setBalance(newBalance);
    setGoal(newGoal);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempBalance(balance.toString());
    setTempGoal(goal.toString());
    setIsOpen(false);
  };

  const addQuickAmount = (amount: number, type: 'earn' | 'spend') => {
    addTransaction(type, amount, type === 'earn' ? 'Manual earning entry' : 'Manual expense entry');
  };

  const goalProgress = Math.min((balance / goal) * 100, 100);
  const totalEarnings = transactions.filter(t => t.type === 'earn').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'spend').reduce((sum, t) => sum + t.amount, 0);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="h-5 w-5 text-green-600" />
                My Earnings
              </CardTitle>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(balance)}
              </div>
              <div className="text-sm text-muted-foreground">
                Current balance
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Monthly Goal Progress</span>
                <span>{goalProgress.toFixed(0)}%</span>
              </div>
              <Progress value={goalProgress} className="h-2" />
              <div className="text-xs text-muted-foreground">
                Goal: {formatCurrency(goal)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Total Earned</div>
                <div className="font-semibold text-green-600">
                  {formatCurrency(totalEarnings)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Total Spent</div>
                <div className="font-semibold text-red-600">
                  {formatCurrency(totalExpenses)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Earnings Manager
          </DialogTitle>
          <DialogDescription>
            Track your marketplace earnings and manage your financial goals
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1">
                  <PiggyBank className="h-4 w-4 text-green-600" />
                  Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(balance)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1">
                  <ArrowUpRight className="h-4 w-4 text-blue-600" />
                  Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totalEarnings)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1">
                  <Target className="h-4 w-4 text-purple-600" />
                  Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(goal)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="quick" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="quick">Quick Actions</TabsTrigger>
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="history">Transaction History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="quick" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Add Earnings</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[10, 25, 50, 100, 250, 500].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => addQuickAmount(amount, 'earn')}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label>Add Expenses</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[5, 10, 25, 50, 100].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => addQuickAmount(amount, 'spend')}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Minus className="h-3 w-3 mr-1" />
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="manual" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="balance">Current Balance (INR)</Label>
                  <Input
                    id="balance"
                    type="number"
                    min="0"
                    step="0.01"
                    value={tempBalance}
                    onChange={(e) => setTempBalance(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goal">Monthly Goal (INR)</Label>
                  <Input
                    id="goal"
                    type="number"
                    min="0"
                    step="0.01"
                    value={tempGoal}
                    onChange={(e) => setTempGoal(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleCancel} variant="outline" className="flex-1">
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button onClick={handleSave} className="flex-1">
                  <Save className="h-4 w-4 mr-1" />
                  Save Changes
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="space-y-4">
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-1 rounded-full ${
                        transaction.type === 'earn' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'earn' ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{transaction.description}</div>
                        <div className="text-xs text-muted-foreground">{transaction.date}</div>
                      </div>
                    </div>
                    <div className={`font-semibold ${
                      transaction.type === 'earn' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {transaction.type === 'earn' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}