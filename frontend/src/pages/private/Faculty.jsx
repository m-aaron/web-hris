import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import FacultyTable from "../../components/main/faculty/FacultyTable";
import FacultyModal from "../../components/main/faculty/FacultyModal";
import ConfirmModal from "../../components/main/ui/ConfirmModal";
import SelectField from "../../components/main/ui/SelectField";
import { Card } from "../../components/main/ui/Card";
import PageHeader from "../../components/main/ui/PageHeader";
import Button from "../../components/Button";

import { useFacultiesQuery } from "../../hooks/useFacultiesQuery";
import { getFaculties, createFaculty, updateFaculty, deleteFaculty } from "../../services/facultyService";
import { getSchoolYear } from "../../helpers/schoolYearHelper";
import API from "../../api/axios";

export default function FacultyPage() {
  const navigate = useNavigate();

  const [query, setQuery] = useState({ department: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [departments, setDepartments] = useState([]);

  const { data, loading, refetch, removeFromList } = useFacultiesQuery(query);

  const schoolYear = getSchoolYear();

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get('/departments');
        setDepartments(res.data.departments || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const openAdd = () => {
    setModalMode('add');
    setEditingFaculty(null);
    setModalOpen(true);
  };

  const openEdit = (faculty) => {
    setModalMode('edit');
    setEditingFaculty(faculty);
    setModalOpen(true);
  };

  const handleSubmit = async (payload) => {
    try {
      console.log("Submitting faculty with payload:", payload);
      if (modalMode === 'add') {
        await createFaculty(payload);
        toast.success('Faculty added');
      } else {
        await updateFaculty(editingFaculty.id, payload);
        toast.success('Faculty updated');
      }
      setModalOpen(false);
      refetch();
      return true;
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save faculty');
      return false;
    }
  };

  const handleDelete = (faculty) => {
    setToDelete(faculty);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteFaculty(toDelete.id);
      removeFromList([toDelete.id]);
      setShowDeleteModal(false);
      toast.success('Faculty deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete faculty');
    }
  };

  return (
    <div className="space-y-6">
        <PageHeader
            title="Faculty List"
            actions={
            <Button
                size="small"
                className="w-full md:w-auto"
                onClick={openAdd} 
                showReset={true}
            >
                    + Add Faculty
            </Button>
            }
            className="pt-2"
        />

      {/* <FacultyHeader onCreate={openAdd} showReset={true} onResetFilters={() => setQuery({ department: '' })} /> */}

      <Card className="rounded-2xl shadow-sm transition-all duration-300 hover:shadow-lg">
        <div className="p-4 flex-1 flex flex-col bg-card rounded-2xl overflow-hidden">

          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <SelectField label="Department" value={query.department} onChange={(v) => setQuery((p) => ({ ...p, department: v }))  } options={[{ value: '', label: 'All' }, ...departments.map(d => ({ value: String(d.id), label: d.name }))]} />

            <div />
          </div>

          <FacultyTable faculties={data || []} loading={loading} onEdit={openEdit} onDelete={handleDelete} query={query} setQuery={setQuery} />

        </div>
      </Card>

      <FacultyModal isOpen={modalOpen} mode={modalMode} initialValues={editingFaculty || {}} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} />

      {showDeleteModal && (
        <ConfirmModal
          title="Delete Faculty?"
          description={`Delete ${toDelete ? (toDelete.employee_no || `${toDelete.last_name || ''}, ${toDelete.first_name || ''}`) : ''}?`}
          action="Delete"
          primaryButtonVariant="solidDanger"
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
