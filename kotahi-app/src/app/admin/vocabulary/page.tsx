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
  useGetVocabulariesQuery,
  useCreateVocabularyMutation,
  useUpdateVocabularyMutation,
  useDeleteVocabularyMutation,
} from "@/lib/api";
import { toast } from "sonner";
import type {
  Vocabulary,
  CreateVocabularyRequest,
  UpdateVocabularyRequest,
} from "@/lib/types";

export default function VocabularyManagement() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingVocabulary, setEditingVocabulary] = useState<Vocabulary | null>(
    null
  );
  const [formData, setFormData] = useState({
    maori_word: "",
    english_translation: "",
    pronunciation: "",
    example_sentence: "",
    category: "",
  });

  const { data: vocabularies, isLoading } = useGetVocabulariesQuery();
  const [createVocabulary] = useCreateVocabularyMutation();
  const [updateVocabulary] = useUpdateVocabularyMutation();
  const [deleteVocabulary] = useDeleteVocabularyMutation();

  const token = localStorage.getItem("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Authentication required");
      return;
    }

    try {
      if (editingVocabulary) {
        const updateData: UpdateVocabularyRequest = {
          maori_word: formData.maori_word,
          english_translation: formData.english_translation,
          pronunciation: formData.pronunciation || undefined,
          example_sentence: formData.example_sentence || undefined,
          category: formData.category || undefined,
        };
        await updateVocabulary({
          token,
          id: editingVocabulary.id,
          data: updateData,
        });
        toast.success("Vocabulary updated successfully!");
      } else {
        const createData: CreateVocabularyRequest = {
          maori_word: formData.maori_word,
          english_translation: formData.english_translation,
          pronunciation: formData.pronunciation || undefined,
          example_sentence: formData.example_sentence || undefined,
          category: formData.category || undefined,
        };
        await createVocabulary({ token, data: createData });
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
      maori_word: vocabulary.maori,
      english_translation: vocabulary.english,
      pronunciation: "",
      example_sentence: "",
      category: "",
    });
    setIsCreating(true);
  };

  const handleDelete = async (vocabularyId: string) => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    if (!confirm("Are you sure you want to delete this vocabulary item?")) {
      return;
    }

    try {
      await deleteVocabulary({ token, id: vocabularyId });
      toast.success("Vocabulary deleted successfully!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Delete failed");
    }
  };

  const resetForm = () => {
    setFormData({
      maori_word: "",
      english_translation: "",
      pronunciation: "",
      example_sentence: "",
      category: "",
    });
    setEditingVocabulary(null);
    setIsCreating(false);
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
        <Button onClick={() => setIsCreating(true)}>Add New Vocabulary</Button>
      </div>

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
                    value={formData.maori_word}
                    onChange={(e) =>
                      setFormData({ ...formData, maori_word: e.target.value })
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
                    value={formData.english_translation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        english_translation: e.target.value,
                      })
                    }
                    placeholder="English translation"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Pronunciation
                  </label>
                  <Input
                    value={formData.pronunciation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pronunciation: e.target.value,
                      })
                    }
                    placeholder="Pronunciation guide"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category
                  </label>
                  <Input
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="Category (e.g., Greetings, Food)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Example Sentence
                </label>
                <Input
                  value={formData.example_sentence}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      example_sentence: e.target.value,
                    })
                  }
                  placeholder="Example sentence using this word"
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

      {/* Vocabulary List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vocabularies?.map((vocabulary: Vocabulary) => (
          <Card key={vocabulary.id}>
            <CardHeader>
              <CardTitle className="text-lg">{vocabulary.maori}</CardTitle>
              <CardDescription>{vocabulary.english}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  <strong>Description:</strong> {vocabulary.description}
                </p>
              </div>
              <div className="flex gap-2 mt-4">
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
            </CardContent>
          </Card>
        ))}
      </div>

      {vocabularies?.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              No vocabulary items found. Add your first vocabulary item to get
              started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
