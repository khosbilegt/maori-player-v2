import React from "react";
import VocabularyList from "../../components/admin/VocabularyList";
import "./AdminPage.css";

// interface Vocabulary {
//   id: string;
//   maori: string;
//   english: string;
//   pronunciation: string;
//   description: string;
//   created_at: string;
//   updated_at: string;
// }

const AdminVocabulary: React.FC = () => {
  // const handleEdit = (vocabulary: Vocabulary) => {
  //   console.log("Edit vocabulary:", vocabulary);
  // };

  const handleDelete = (id: string) => {
    console.log("Delete vocabulary:", id);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Vocabulary Management</h1>
        <p>Create, edit, and manage Māori vocabulary items</p>
      </div>

      <VocabularyList onDelete={handleDelete} />
    </div>
  );
};

export default AdminVocabulary;
