import React, { useState } from 'react';
import { Course } from './api';

interface CourseFormProps {
  course?: Course;
  onSave: (course: Omit<Course, 'id'>) => void;
  onCancel: () => void;
}

const CourseForm: React.FC<CourseFormProps> = ({ course, onSave, onCancel }) => {
  const [name, setName] = useState(course?.name || '');
  const [nameId, setNameId] = useState(course?.nameId || '');
  const [credits, setCredits] = useState(course?.credits || 3);
  const [type, setType] = useState<Course['type']>(course?.type || 'uni_core');
  const [topics, setTopics] = useState<string[]>(course?.topics || []);
  const [references, setReferences] = useState<string[]>(course?.references || []);
  const [newTopic, setNewTopic] = useState('');
  const [newReference, setNewReference] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const courseData: Omit<Course, 'id'> = {
      name,
      nameId,
      credits,
      type,
      semester: course?.semester || null,
      x: course?.x || Math.random() * 400 + 50,
      y: course?.y || Math.random() * 200 + 50,
      topics: topics.length > 0 ? topics : [],
      references: references.length > 0 ? references : [],
    };
    onSave(courseData);
  };

  const addTopic = () => {
    if (newTopic.trim()) {
      setTopics([...topics, newTopic.trim()]);
      setNewTopic('');
    }
  };

  const removeTopic = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  const addReference = () => {
    if (newReference.trim()) {
      setReferences([...references, newReference.trim()]);
      setNewReference('');
    }
  };

  const removeReference = (index: number) => {
    setReferences(references.filter((_, i) => i !== index));
  };

  const inputStyle = { 
    width: '100%', 
    boxSizing: 'border-box' as const,
    borderRadius: 10, 
    border: '1px solid #e5e7eb', 
    padding: '10px 12px', 
    outline: 'none' 
  };

  return (
    <div style={{
      position: 'relative',
      background: '#ffffff',
      padding: '24px',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(2, 6, 23, 0.15)',
      zIndex: 4,
      minWidth: '360px',
      maxWidth: '560px',
      maxHeight: '90vh',
      overflowY: 'auto'
    }}>
      <h3 style={{ margin: '0 0 16px', color: '#0f172a' }}>{course ? 'Edit Course' : 'Add Course'}</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: 12, color: '#475569', marginBottom: 6 }}>Name (English)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: 12, color: '#475569', marginBottom: 6 }}>Name (Indonesian)</label>
          <input
            type="text"
            value={nameId}
            onChange={(e) => setNameId(e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: 12, color: '#475569', marginBottom: 6 }}>Credits</label>
          <input
            type="number"
            value={credits}
            onChange={(e) => setCredits(Number(e.target.value))}
            min="1"
            max="10"
            required
            style={inputStyle}
          />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: 12, color: '#475569', marginBottom: 6 }}>Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as Course['type'])}
            style={{ ...inputStyle, background: '#fff' }}
          >
            <option value="uni_core">University Core</option>
            <option value="faculty_core">Faculty Core</option>
            <option value="cs_core">CS Core</option>
            <option value="stream">Stream</option>
            <option value="elective">Elective</option>
          </select>
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: 12, color: '#475569', marginBottom: 6 }}>Topics</label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="Add topic"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button type="button" onClick={addTopic} style={{ borderRadius: 10, padding: '10px 12px', background: '#e9eef6', border: 'none', flexShrink: 0 }}>Add</button>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, maxHeight: '120px', overflowY: 'auto', margin: 0 }}>
            {topics.map((topic, index) => (
              <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                <span style={{ color: '#0f172a' }}>{topic}</span>
                <button type="button" onClick={() => removeTopic(index)} style={{ marginLeft: '10px', borderRadius: 8, padding: '6px 8px', background: '#fee2e2', color: '#991b1b', border: 'none', flexShrink: 0 }}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: 12, color: '#475569', marginBottom: 6 }}>References</label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              type="text"
              value={newReference}
              onChange={(e) => setNewReference(e.target.value)}
              placeholder="Add reference"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button type="button" onClick={addReference} style={{ borderRadius: 10, padding: '10px 12px', background: '#e9eef6', border: 'none', flexShrink: 0 }}>Add</button>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, maxHeight: '120px', overflowY: 'auto', margin: 0 }}>
            {references.map((ref, index) => (
              <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                <span style={{ color: '#0f172a' }}>{ref}</span>
                <button type="button" onClick={() => removeReference(index)} style={{ marginLeft: '10px', borderRadius: 8, padding: '6px 8px', background: '#fee2e2', color: '#991b1b', border: 'none', flexShrink: 0 }}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="submit" style={{ borderRadius: 10, padding: '10px 14px', background: '#2f80ed', color: '#fff', border: 'none' }}>Save</button>
          <button type="button" onClick={onCancel} style={{ borderRadius: 10, padding: '10px 14px', background: '#e9eef6', border: 'none' }}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;