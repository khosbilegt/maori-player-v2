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
  useGetVocabulariesQuery,
  useCreateVocabularyMutation,
  useUpdateVocabularyMutation,
  useDeleteVocabularyMutation,
} from "@/lib/api";
import { toast } from "sonner";
import VocabularyBatchUpload from "@/components/admin/vocabulary_batch_upload";
import type {
  Vocabulary,
  CreateVocabularyRequest,
  UpdateVocabularyRequest,
} from "@/lib/types";

export default function VocabularyManagement() {
  const [isCreating, setIsCreating] = useState(false);
  const [showBatchUpload, setShowBatchUpload] = useState(false);
  const [editingVocabulary, setEditingVocabulary] = useState<Vocabulary | null>(
    null
  );
  const [formData, setFormData] = useState({
    maori: "",
    english: "",
    description: "",
  });

  const { data: vocabularies, isLoading } = useGetVocabulariesQuery();
  const [createVocabulary] = useCreateVocabularyMutation();
  const [updateVocabulary] = useUpdateVocabularyMutation();
  const [deleteVocabulary] = useDeleteVocabularyMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingVocabulary) {
        const updateData: UpdateVocabularyRequest = {
          maori: formData.maori,
          english: formData.english,
          description: formData.description || undefined,
        };
        await updateVocabulary({ id: editingVocabulary.id, data: updateData });
        toast.success("Vocabulary updated successfully!");
      } else {
        const createData: CreateVocabularyRequest = {
          maori: formData.maori,
          english: formData.english,
          description: formData.description || undefined,
        };
        await createVocabulary(createData);
        toast.success("Vocabulary created successfully!");
      }

      resetForm();
    } catch (error: any) {
      toast.error(error?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (vocabulary: Vocabulary) => {
    setEditingVocabulary(vocabulary);
    setFormData({
      maori: vocabulary.maori,
      english: vocabulary.english,
      description: vocabulary.description || "",
    });
    setIsCreating(true);
  };

  const handleDelete = async (vocabularyId: string) => {
    if (!confirm("Are you sure you want to delete this vocabulary item?")) {
      return;
    }

    try {
      await deleteVocabulary(vocabularyId);
      toast.success("Vocabulary deleted successfully!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Delete failed");
    }
  };

  const resetForm = () => {
    setFormData({
      maori: "",
      english: "",
      description: "",
    });
    setEditingVocabulary(null);
    setIsCreating(false);
    setShowBatchUpload(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Vocabulary Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage Maori vocabulary database
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowBatchUpload(!showBatchUpload)}
          >
            {showBatchUpload ? "Hide Batch Upload" : "Batch Upload"}
          </Button>
          <Button onClick={() => setIsCreating(true)}>
            Add New Vocabulary
          </Button>
        </div>
      </div>

      {/* Batch Upload */}
      {showBatchUpload && <VocabularyBatchUpload />}

      {/* Create/Edit Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingVocabulary ? "Edit Vocabulary" : "Add New Vocabulary"}
            </CardTitle>
            <CardDescription>
              {editingVocabulary
                ? "Update vocabulary information"
                : "Add a new vocabulary item"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Maori Word *
                  </label>
                  <Input
                    value={formData.maori}
                    onChange={(e) =>
                      setFormData({ ...formData, maori: e.target.value })
                    }
                    placeholder="Maori word"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    English Translation *
                  </label>
                  <Input
                    value={formData.english}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        english: e.target.value,
                      })
                    }
                    placeholder="English translation"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Description"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingVocabulary
                    ? "Update Vocabulary"
                    : "Create Vocabulary"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Vocabulary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vocabulary Items</CardTitle>
          <CardDescription>
            Manage all vocabulary items in the database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Maori Word</TableHead>
                <TableHead>English Translation</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vocabularies?.map((vocabulary: Vocabulary) => (
                <TableRow key={vocabulary.id}>
                  <TableCell className="font-medium">
                    {vocabulary.maori}
                  </TableCell>
                  <TableCell>{vocabulary.english}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {vocabulary.description}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" onClick={() => handleEdit(vocabulary)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(vocabulary.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {vocabularies?.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                No vocabulary items found. Add your first vocabulary item to get
                started.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
