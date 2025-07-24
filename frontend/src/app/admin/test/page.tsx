'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TestTube, GitCompare } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { CurriculumBuilder } from '@/features/courses/components/CurriculumBuilder';
import { CurriculumBuilderReconstruct } from '@/features/courses/components/CurriculumBuilderReconstruct';
import { CurriculumBuilder as CurriculumBuilderRestore } from '@/features/courses/components/CurriculumBuilderRestore';

export default function TestPage() {
  const [activeTab, setActiveTab] = useState('original');
  
  usePageTitle('Test Page', 'Compare CurriculumBuilder components');

  // Use real curriculum data for testing
  const mockCurriculumId = '11b34484-21cc-46ca-9475-02fccd13a386';
  const mockCourseId = '1'; // Will be loaded from curriculum data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
            <TestTube className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Component Test Page</h1>
            <p className="text-gray-600">Compare CurriculumBuilder implementations</p>
          </div>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <GitCompare className="h-3 w-3" />
          Comparison Mode
        </Badge>
      </div>

      {/* Component Comparison Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="original" className="flex items-center gap-2">
            Original
          </TabsTrigger>
          <TabsTrigger value="restore" className="flex items-center gap-2">
            Restore
          </TabsTrigger>
          <TabsTrigger value="reconstruct" className="flex items-center gap-2">
            Reconstruct
          </TabsTrigger>
        </TabsList>

        <TabsContent value="original" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    Original CurriculumBuilder
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Current implementation with basic props interface
                  </p>
                </div>
                <Badge variant="secondary">Current</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-gray-50">
                <CurriculumBuilder
                  curriculumId={mockCurriculumId}
                  onBack={() => console.log('Back clicked')}
                  className="bg-white rounded-lg border"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restore" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    CurriculumBuilderRestore
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Restored implementation with streamlined interface
                  </p>
                </div>
                <Badge variant="secondary">Restored</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-gray-50">
                <CurriculumBuilderRestore
                  curriculumId={mockCurriculumId}
                  onBack={() => console.log('Back clicked')}
                  className="bg-white rounded-lg border"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reconstruct" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    CurriculumBuilderReconstruct
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Enhanced implementation with mode support and callbacks
                  </p>
                </div>
                <Badge variant="default">Reconstructed</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-gray-50">
                <CurriculumBuilderReconstruct
                  mode="edit"
                  curriculumId={mockCurriculumId}
                  courseId={mockCourseId}
                  onSave={async (structure) => {
                    console.log('Save callback:', structure);
                  }}
                  onSaveDraft={async (structure) => {
                    console.log('Save draft callback:', structure);
                  }}
                  onBack={() => console.log('Back clicked')}
                  className="bg-white rounded-lg border"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Comparison Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Component Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Original CurriculumBuilder</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Basic props interface</li>
                <li>• curriculumId, onBack, className props</li>
                <li>• Standard curriculum editing functionality</li>
                <li>• Current implementation in use</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">CurriculumBuilderRestore</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Streamlined interface</li>
                <li>• Clean navigation system</li>
                <li>• Horizontal scrolling module grid</li>
                <li>• Progression settings integration</li>
                <li>• Restored from backup attempt</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">CurriculumBuilderReconstruct</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Enhanced props interface with mode support</li>
                <li>• create/edit mode switching</li>
                <li>• onSave and onSaveDraft callbacks</li>
                <li>• Course context support for create mode</li>
                <li>• Reconstructed from conversation context</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}