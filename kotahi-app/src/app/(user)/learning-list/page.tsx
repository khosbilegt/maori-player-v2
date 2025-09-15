"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useLearningList,
  useLearningListMutations,
  useLearningListStats,
} from "@/lib/hooks/api";
import { toast } from "sonner";
import type {
  LearningListItem,
  CreateLearningListItemRequest,
  UpdateLearningListItemRequest,
} from "@/lib/types";
import { Plus, Edit, Trash2, BookOpen, CheckCircle, Clock } from "lucide-react";

export default function LearningListPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingItem, setEditingItem] = useState<LearningListItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    text: "",
    notes: "",
    video_id: "",
  });

  const {
    data: learningListData,
    isLoading,
    error,
    refetch,
  } = useLearningList({
    status: statusFilter === "all" ? undefined : statusFilter,
  });
  const { data: statsData } = useLearningListStats();
  const { createItem, updateItem, deleteItem } = useLearningListMutations();

  const learningList = learningListData?.data || [];
  const stats = statsData?.data;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingItem) {
        const updateData: UpdateLearningListItemRequest = {
          text: formData.text,
          notes: formData.notes || undefined,
        };
        await updateItem(editingItem.id, updateData);
        toast.success("Learning item updated successfully!");
      } else {
        const createData: CreateLearningListItemRequest = {
          text: formData.text,
          notes: formData.notes || undefined,
          video_id: formData.video_id || undefined,
        };
        await createItem(createData);
        toast.success("Learning item created successfully!");
      }

      resetForm();
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (item: LearningListItem) => {
    setEditingItem(item);
    setFormData({
      text: item.text,
      notes: item.notes || "",
      video_id: item.video_id || "",
    });
    setIsCreating(true);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this learning item?")) {
      return;
    }

    try {
      await deleteItem(itemId);
      toast.success("Learning item deleted successfully!");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Delete failed");
    }
  };

  const handleStatusChange = async (itemId: string, newStatus: string) => {
    try {
      await updateItem(itemId, { status: newStatus });
      toast.success("Status updated successfully!");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Status update failed");
    }
  };

  const resetForm = () => {
    setFormData({
      text: "",
      notes: "",
      video_id: "",
    });
    setEditingItem(null);
    setIsCreating(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <Clock className="w-4 h-4" />;
      case "learning":
        return <BookOpen className="w-4 h-4" />;
      case "learned":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "learning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "learned":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Learning List
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track your Māori language learning progress
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Items
                  </p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    New
                  </p>
                  <p className="text-2xl font-bold">{stats.new}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Learning
                  </p>
                  <p className="text-2xl font-bold">{stats.learning}</p>
                </div>
                <BookOpen className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Learned
                  </p>
                  <p className="text-2xl font-bold">{stats.learned}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create/Edit Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingItem ? "Edit Learning Item" : "Add New Learning Item"}
            </CardTitle>
            <CardDescription>
              {editingItem
                ? "Update your learning item"
                : "Add a new word, phrase, or concept to your learning list"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Text *</label>
                <Input
                  value={formData.text}
                  onChange={(e) =>
                    setFormData({ ...formData, text: e.target.value })
                  }
                  placeholder="Enter word, phrase, or concept"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Add notes, context, or examples"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Video ID (Optional)
                </label>
                <Input
                  value={formData.video_id}
                  onChange={(e) =>
                    setFormData({ ...formData, video_id: e.target.value })
                  }
                  placeholder="Associated video ID"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingItem ? "Update Item" : "Add Item"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filter and Learning List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Learning Items</CardTitle>
              <CardDescription>Manage your learning progress</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="learned">Learned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-600">Failed to load learning items</p>
            </div>
          ) : learningList.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                No learning items found. Add your first item to get started!
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Text</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {learningList.map((item: LearningListItem) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.text}</TableCell>
                    <TableCell>
                      <Select
                        value={item.status}
                        onValueChange={(value) =>
                          handleStatusChange(item.id, value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(item.status)}
                            <span className="capitalize">{item.status}</span>
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              New
                            </div>
                          </SelectItem>
                          <SelectItem value="learning">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4" />
                              Learning
                            </div>
                          </SelectItem>
                          <SelectItem value="learned">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Learned
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {item.notes || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
