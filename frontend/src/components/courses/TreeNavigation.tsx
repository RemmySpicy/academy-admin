/**
 * TreeNavigation component for curriculum hierarchy
 */

import { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, FolderOpen, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TreeNode } from '@/lib/api/types';
import { cn } from '@/lib/utils';

interface TreeNavigationProps {
  data: TreeNode[];
  onNodeSelect?: (node: TreeNode) => void;
  selectedNodeId?: string;
  searchable?: boolean;
  className?: string;
}

interface TreeNodeItemProps {
  node: TreeNode;
  level: number;
  onSelect?: (node: TreeNode) => void;
  selectedNodeId?: string;
  searchTerm?: string;
}

const TreeNodeItem: React.FC<TreeNodeItemProps> = ({
  node,
  level,
  onSelect,
  selectedNodeId,
  searchTerm,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedNodeId === node.id;

  const shouldShowNode = () => {
    if (!searchTerm) return true;
    
    const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         node.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const childrenMatch = node.children?.some(child => 
      shouldShowChild(child, searchTerm)
    );
    
    return matchesSearch || childrenMatch;
  };

  const shouldShowChild = (child: TreeNode, term: string): boolean => {
    if (!term) return true;
    
    const matches = child.name.toLowerCase().includes(term.toLowerCase()) ||
                   child.type.toLowerCase().includes(term.toLowerCase());
    
    const childrenMatch = child.children?.some(grandChild => 
      shouldShowChild(grandChild, term)
    );
    
    return matches || childrenMatch;
  };

  const getIcon = () => {
    if (hasChildren) {
      return isExpanded ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const handleToggle = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
    if (onSelect) {
      onSelect(node);
    }
  };

  const getStatusColor = () => {
    switch (node.status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'archived':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (!shouldShowNode()) {
    return null;
  }

  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors",
          isSelected && "bg-blue-50 border border-blue-200",
          "group"
        )}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
        onClick={handleToggle}
      >
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        )}
        
        {!hasChildren && <div className="w-4" />}
        
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {getIcon()}
          <span 
            className={cn(
              "font-medium text-sm truncate",
              searchTerm && node.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
              "bg-yellow-200"
            )}
          >
            {node.name}
          </span>
          
          <Badge
            variant="secondary"
            className={cn("text-xs ml-auto", getStatusColor())}
          >
            {node.type}
          </Badge>
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <div className="ml-2">
          {node.children?.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedNodeId={selectedNodeId}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export function TreeNavigation({
  data,
  onNodeSelect,
  selectedNodeId,
  searchable = true,
  className,
}: TreeNavigationProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandAll, setExpandAll] = useState(false);

  const handleExpandAll = () => {
    setExpandAll(!expandAll);
    // This is a simplified approach - in a real implementation, you'd need to manage expansion state
  };

  const filteredData = data.filter(node => {
    if (!searchTerm) return true;
    
    const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         node.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const childrenMatch = node.children?.some(child => 
      child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return matchesSearch || childrenMatch;
  });

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Curriculum Structure</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExpandAll}
          >
            {expandAll ? 'Collapse All' : 'Expand All'}
          </Button>
        </div>
        
        {searchable && (
          <div className="relative">
            <Input
              placeholder="Search curriculum..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        {filteredData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No results found' : 'No curriculum data available'}
          </div>
        ) : (
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {filteredData.map((node) => (
              <TreeNodeItem
                key={node.id}
                node={node}
                level={0}
                onSelect={onNodeSelect}
                selectedNodeId={selectedNodeId}
                searchTerm={searchTerm}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}