import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';

export default function AssessmentBuilder() {
  const [assessments, setAssessments] = useState<any[]>([]);

  useEffect(() => { api.get('/assessments').then(r => setAssessments(r.data)); }, []);

  const publish = async (id: string) => {
    await api.patch(`/assessments/${id}/publish`);
    toast.success('Published!');
    setAssessments(prev => prev.map(a => a.id === id ? { ...a, isPublished: true } : a));
  };

  return (
    <div className="space-y-6 fade-in-up">
      <h1 className="text-2xl font-bold text-white">Assessments</h1>
      <div className="space-y-3">
        {assessments.map(a => (
          <div key={a.id} className="card-hover flex items-center justify-between">
            <div>
              <p className="font-medium text-white">{a.title}</p>
              <p className="text-xs text-gray-500">{a.durationMinutes} min · Skills: {(a.skillIds ?? []).length}</p>
            </div>
            <div className="flex gap-2">
              {!a.isPublished && <button onClick={() => publish(a.id)} className="btn-accent btn-sm">Publish</button>}
              {a.isPublished && <span className="badge-verified">Published</span>}
            </div>
          </div>
        ))}
        {assessments.length === 0 && <p className="text-gray-500 text-sm text-center py-12">No assessments yet. Seed data includes a ready-to-use Python+Django assessment.</p>}
      </div>
    </div>
  );
}
