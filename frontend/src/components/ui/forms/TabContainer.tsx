/**
 * Reusable tab container with progress indication
 */

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Circle } from 'lucide-react';

export interface TabConfig {
  id: string;
  label: string;
  icon?: React.ReactNode;
  required?: boolean;
  completed?: boolean;
}

interface TabContainerProps {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
  showProgress?: boolean;
}

export function TabContainer({
  tabs,
  activeTab,
  onTabChange,
  children,
  showProgress = true
}: TabContainerProps) {
  const completedTabs = tabs.filter(tab => tab.completed).length;
  const totalTabs = tabs.length;
  const progressPercentage = (completedTabs / totalTabs) * 100;

  return (
    <div className="space-y-4">
      {showProgress && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">Form Progress</CardTitle>
                <CardDescription>
                  {completedTabs} of {totalTabs} sections completed
                </CardDescription>
              </div>
              <div className="text-sm font-medium text-gray-600">
                {Math.round(progressPercentage)}%
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </CardHeader>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-1">
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className="flex items-center space-x-2 text-xs sm:text-sm px-2 py-2"
            >
              {showProgress && (
                <span className="hidden sm:inline">
                  {tab.completed ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-gray-400" />
                  )}
                </span>
              )}
              {tab.icon && <span className="hidden md:inline">{tab.icon}</span>}
              <span className="truncate">{tab.label}</span>
              {tab.required && <span className="text-red-500 text-xs">*</span>}
            </TabsTrigger>
          ))}
        </TabsList>

        {children}
      </Tabs>
    </div>
  );
}

interface TabPanelProps {
  value: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function TabPanel({ value, title, description, icon, children }: TabPanelProps) {
  return (
    <TabsContent value={value} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {icon && <span>{icon}</span>}
            <span>{title}</span>
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4">
          {children}
        </CardContent>
      </Card>
    </TabsContent>
  );
}

export default TabContainer;