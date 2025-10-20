import React, { useState, useEffect } from 'react';
// @ts-ignore
import { Stage, Layer, Rect, Text } from 'react-konva';
import { api, Course, AuthResponse } from './api';
import CourseForm from './CourseForm';
import LoginForm from './LoginForm';
import { websocket } from './websocket';

const App: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  
  // Set up websocket event listeners
  useEffect(() => {
    if (!isLoggedIn) return;
    
    // Join a default room for collaboration
    websocket.joinRoom('default');
    
    // Listen for course movement events
    const handleCourseMoved = (data: { course: any }) => {
      setCourses(prev =>
        prev.map(course =>
          course.id === data.course.id
            ? { ...course, ...data.course }
            : course
        )
      );
    };
    
    // Listen for course update events
    const handleCourseUpdated = (data: { course: any }) => {
      setCourses(prev =>
        prev.map(course =>
          course.id === data.course.id
            ? { ...course, ...data.course }
            : course
        )
      );
    };
    
    // Listen for course addition events
    const handleCourseAdded = (data: { course: any }) => {
      setCourses(prev => [...prev, data.course]);
    };
    
    // Listen for course deletion events
    const handleCourseDeleted = (data: { courseId: number }) => {
      setCourses(prev => prev.filter(course => course.id !== data.courseId));
    };
    
    websocket.on('courseMoved', handleCourseMoved);
    websocket.on('courseUpdated', handleCourseUpdated);
    websocket.on('courseAdded', handleCourseAdded);
    websocket.on('courseDeleted', handleCourseDeleted);
    
    // Clean up event listeners on unmount
    return () => {
      websocket.leaveRoom();
      websocket.off('courseMoved', handleCourseMoved);
      websocket.off('courseUpdated', handleCourseUpdated);
      websocket.off('courseAdded', handleCourseAdded);
      websocket.off('courseDeleted', handleCourseDeleted);
    };
  }, [isLoggedIn]);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      api.setToken(token);
      setIsLoggedIn(true);
      loadCourses();
    }
  }, []);

  const loadCourses = () => {
    api.getCourses().then(setCourses).catch(() => {
      console.log('Backend not available, using empty course list');
    });
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const response: AuthResponse = await api.login(email, password);
      localStorage.setItem('token', response.access_token);
      // Set the token for websocket authentication
      websocket.setToken(response.access_token);
      // Connect to websocket
      await websocket.connect();
      setIsLoggedIn(true);
      setShowLogin(false);
      loadCourses();
    } catch (error) {
      throw new Error('Login failed. Please check your credentials.');
    }
  };

  const handleRegister = async (username: string, email: string, password: string) => {
    try {
      const response: AuthResponse = await api.register(username, email, password);
      localStorage.setItem('token', response.access_token);
      // Set the token for websocket authentication
      websocket.setToken(response.access_token);
      // Connect to websocket
      await websocket.connect();
      setIsLoggedIn(true);
      setShowLogin(false);
      loadCourses();
    } catch (error) {
      throw new Error('Registration failed. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    api.setToken(null);
    setIsLoggedIn(false);
    setShowLogin(true);
    setCourses([]);
  };

  const handleAddCourse = () => {
    setEditingCourse(undefined);
    setShowForm(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      await api.deleteCourse(courseId);
      setCourses(prev => prev.filter(c => c.id !== courseId));
      
      // Notify websocket of course deletion
      websocket.deleteCourse(courseId);
    }
  };

  const handleSaveCourse = async (courseData: Omit<Course, 'id'>) => {
    try {
      if (editingCourse) {
        const updated = await api.updateCourse(editingCourse.id, courseData);
        setCourses(prev => prev.map(c => c.id === editingCourse.id ? updated : c));
        
        // Notify websocket of course update
        websocket.updateCourse(editingCourse.id, courseData);
      } else {
        const newCourse = await api.createCourse(courseData);
        setCourses(prev => [...prev, newCourse]);
        
        // Notify websocket of course addition
        websocket.addCourse(courseData);
      }
      setShowForm(false);
    } catch (error) {
      console.error('Failed to save course:', error);
      alert('Failed to save course. Please check if the backend is running.');
    }
  };

  const [draggedCourse, setDraggedCourse] = useState<Course | null>(null);
  const [hoverSemester, setHoverSemester] = useState<number | null>(null);
  const [placeholderPosition, setPlaceholderPosition] = useState<{ x: number; y: number; semesterId: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isDraggingCourse, setIsDraggingCourse] = useState(false);
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set());
  const [hoveredCourseId, setHoveredCourseId] = useState<number | null>(null);

  const toggleCourseExpanded = (courseId: number) => {
    setExpandedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  // Calculate total credits from all courses in semesters
  const totalCredits = courses
    .filter(course => course.semester !== null)
    .reduce((sum, course) => sum + course.credits, 0);

  const handleDragStart = (course: Course) => {
    setDraggedCourse(course);
    setIsDraggingCourse(true);
  };

  const semesterBoxes = [
    { id: 1, x: 50, y: 150, width: 200, height: 530 },
    { id: 2, x: 270, y: 150, width: 200, height: 530 },
    { id: 3, x: 490, y: 150, width: 200, height: 530 },
    { id: 4, x: 710, y: 150, width: 200, height: 530 },
    { id: 5, x: 930, y: 150, width: 200, height: 530 },
    { id: 6, x: 1150, y: 150, width: 200, height: 530 },
    { id: 7, x: 1370, y: 150, width: 200, height: 530 },
    { id: 8, x: 1590, y: 150, width: 200, height: 530 },
  ];

  const handleDragMove = (e: any) => {
    if (!draggedCourse) return;

    const pos = e.target.position();

    for (const box of semesterBoxes) {
      if (pos.x >= box.x && pos.x <= box.x + box.width && pos.y >= box.y && pos.y <= box.y + box.height) {
        const nextY = getNextVerticalPosition(box.id);
        const snappedX = snapToGrid(pos.x - box.x) + box.x;
        setPlaceholderPosition({ x: snappedX, y: nextY, semesterId: box.id });
        setHoverSemester(box.id);
        return;
      }
    }
    setPlaceholderPosition(null);
    setHoverSemester(null);
  };

  const snapToGrid = (value: number, gridSize: number = 20) => {
    return Math.round(value / gridSize) * gridSize;
  };

  const getNextVerticalPosition = (semesterId: number, courseHeight: number = 100) => {
    // Find all courses in this semester, sorted by Y position
    const semesterCourses = courses
      .filter(c => c.semester === semesterId)
      .sort((a, b) => a.y - b.y);

    if (semesterCourses.length === 0) {
      // First course in semester - place with uniform top margin
      return 200; // Start with 25px margin below semester title bar
    }

    // Find gaps between existing courses and place in the first available gap
    const semesterBox = semesterBoxes.find(s => s.id === semesterId);
    if (!semesterBox) return 185;

    const courseSpacing = 15; // Increased spacing for better visual separation
    let currentY = 185; // Start position with margin

    for (let i = 0; i < semesterCourses.length; i++) {
      const course = semesterCourses[i];
      const courseBottom = course.y + courseHeight + courseSpacing;

      // Check if there's space before this course
      if (currentY + courseHeight + courseSpacing <= course.y) {
        return currentY;
      }

      // Move to after this course
      currentY = Math.max(currentY, courseBottom);
    }

    // Place at the end if no gaps found
    return currentY;
  };

  const handleDragEnd = (e: any, courseId: number) => {
    let newX = e.target.x();
    let newY = e.target.y();

    // Check if dropped in a semester box
    let newSemester: number | null = null;

    for (const box of semesterBoxes) {
      if (newX >= box.x && newX <= box.x + box.width && newY >= box.y && newY <= box.y + box.height) {
        newSemester = box.id;
        // Stack vertically - place at next available position
        newY = getNextVerticalPosition(box.id);
        // Snap horizontally to grid within the semester box
        newX = snapToGrid(newX - box.x) + box.x;
        // Ensure course stays within semester bounds
        newX = Math.max(box.x, Math.min(newX, box.x + box.width - 150));
        break;
      }
    }

    // Update local state optimistically
    setCourses(prev =>
      prev.map(course =>
        course.id === courseId
          ? { ...course, x: newX, y: newY, semester: newSemester }
          : course
      )
    );

    // Clear hover state and placeholder
    setDraggedCourse(null);
    setHoverSemester(null);
    setPlaceholderPosition(null);
    setIsDraggingCourse(false);

    // Persist to API
    api.updateCourse(courseId, { x: newX, y: newY, semester: newSemester }).catch(console.error);
    
    // Notify websocket of course movement
    websocket.moveCourse(courseId, String(courses.find(c => c.id === courseId)?.semester || ''), String(newSemester || ''));
  };

  const handleMouseEnter = (semesterId: number) => {
    if (draggedCourse) {
      setHoverSemester(semesterId);
    }
  };

  const handleMouseLeave = () => {
    setHoverSemester(null);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.5));
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    setZoom(newScale);
  };

  const getAccent = (type: string) => {
    switch (type) {
      case 'uni_core': return '#3b82f6'; // blue-500
      case 'faculty_core': return '#06b6d4'; // cyan-500
      case 'cs_core': return '#8b5cf6'; // violet-500
      case 'stream': return '#10b981'; // emerald-500
      case 'elective': return '#f59e0b'; // amber-500
      default: return '#64748b'; // slate-500
    }
  };

  const getFullTypeName = (type: string) => {
    switch (type) {
      case 'uni_core': return 'University Core';
      case 'faculty_core': return 'Faculty Core';
      case 'cs_core': return 'CS Core';
      case 'stream': return 'Stream';
      case 'elective': return 'Elective';
      default: return type;
    }
  };

  if (!isLoggedIn && showLogin) {
    return (
      <div style={{ width: '100vw', height: '100vh', background: '#f6f8fb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoginForm
          onLogin={handleLogin}
          onRegister={handleRegister}
          onCancel={() => setShowLogin(false)}
        />
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#f6f8fb' }}>
      {/* Toolbar */}
      <div className="toolbar" style={{ padding: '12px 16px', background: '#f6f8fc', borderBottom: '1px solid #e6ebf1', display: 'flex', gap: '10px', alignItems: 'center', position: 'sticky', top: 0, zIndex: 2 }}>
        <button onClick={handleAddCourse} style={{ borderRadius: 10, padding: '8px 12px', background: '#2f80ed', color: '#fff', border: 'none' }}>Add Course</button>
        <button onClick={handleZoomIn} style={{ borderRadius: 10, padding: '8px 12px', background: '#e9eef6', border: 'none' }}>Zoom In</button>
        <button onClick={handleZoomOut} style={{ borderRadius: 10, padding: '8px 12px', background: '#e9eef6', border: 'none' }}>Zoom Out</button>
        <span style={{ color: '#475569', marginLeft: 8 }}>Zoom: {Math.round(zoom * 100)}%</span>
        {isLoggedIn && (
          <button
            onClick={handleLogout}
            style={{
              marginLeft: 'auto',
              borderRadius: 10,
              padding: '8px 12px',
              background: '#ef4444',
              color: '#fff',
              border: 'none'
            }}
          >
            Logout
          </button>
        )}
      </div>

      {/* @ts-ignore */}
      {/* @ts-ignore */}
      <Stage
        width={window.innerWidth}
        height={window.innerHeight - 60}
        scaleX={zoom}
        scaleY={zoom}
        onWheel={handleWheel}
        draggable={!isDraggingCourse}
      >
        <Layer>
          {/* Grid Background (kept) */}
          {Array.from({ length: 50 }, (_, i) =>
            Array.from({ length: 30 }, (_, j) => (
              <Rect
                key={`${i}-${j}`}
                x={i * 50}
                y={j * 50}
                width={50}
                height={50}
                fill="transparent"
                stroke="#e7ebf3"
                strokeWidth={0.5}
              />
            ))
          )}

          {/* Boundary Box - subtle rounded */}
          <Rect x={25} y={90} width={1850} height={600} fill="transparent" stroke="#cbd5e1" strokeWidth={2} cornerRadius={16} />

          {/* Total Credits Display */}
          <Text
            x={35}
            y={100}
            text={`Total Credits: ${totalCredits}`}
            fontSize={20}
            fontStyle="bold"
            fill="#475569"
          />

          {/* Semester Columns - minimalist rounded, Trello-like */}
          {[
            { id: 1, x: 50, y: 150, color: '#f7f9fc' },
            { id: 2, x: 270, y: 150, color: '#f7f9fc' },
            { id: 3, x: 490, y: 150, color: '#f7f9fc' },
            { id: 4, x: 710, y: 150, color: '#f7f9fc' },
            { id: 5, x: 930, y: 150, color: '#f7f9fc' },
            { id: 6, x: 1150, y: 150, color: '#f7f9fc' },
            { id: 7, x: 1370, y: 150, color: '#f7f9fc' },
            { id: 8, x: 1590, y: 150, color: '#f7f9fc' },
          ].map(semester => (
            <React.Fragment key={semester.id}>
              {/* Column container */}
              <Rect
                x={semester.x}
                y={semester.y}
                width={200}
                height={530}
                fill={hoverSemester === semester.id ? '#eef6ff' : semester.color}
                stroke="#e2e8f0"
                strokeWidth={1}
                cornerRadius={12}
                onMouseEnter={() => handleMouseEnter(semester.id)}
                onMouseLeave={handleMouseLeave}
              />

              {/* Column title */}
              <Text
                x={semester.x}
                y={semester.y + 10}
                text={`Semester ${semester.id}`}
                fontSize={14}
                fontStyle="bold"
                fill="#0f172a"
                align="center"
                width={200}
              />

{/* Fixed position # Credits text */}
<Text
  x={semester.x}
  y={semester.y + 35}
  text={`# Credits: ${courses.filter(c => c.semester === semester.id).reduce((sum, c) => sum + c.credits, 0)}`}
  fontSize={12}
  fill="#64748b"
  align="center"
  width={200}
/>

              {/* Snap Placeholder - rounded */}
              {placeholderPosition && placeholderPosition.semesterId === semester.id && (
                <Rect
                  x={placeholderPosition.x + 10}
                  y={placeholderPosition.y + 10}
                  width={180}
                  height={100}
                  fill="transparent"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dash={[4, 4]}
                  cornerRadius={12}
                />
              )}
            </React.Fragment>
          ))}

          {/* Course Cards - minimalist Trello-like */}
          {courses.map(course => {
            // Center course horizontally in semester (left-right center)
            const semesterWidth = 200;
            const courseWidth = 180;
            const centeredX = course.semester ?
              (semesterBoxes.find(s => s.id === course.semester)?.x || course.x) + (semesterWidth - courseWidth) / 2 :
              course.x;

            const accent = getAccent(course.type);
            const isExpanded = expandedCourses.has(course.id);
            
            // Calculate card height based on expanded state and content
            let cardHeight = 100; // Base height
            if (isExpanded) {
              // Base height + separator + Type line + Semester line + optional Topics line
              let expandedHeight = 100 + 8; // Base + space after separator
              expandedHeight += 12; // Type line
              expandedHeight += 12; // Semester line
              if (course.topics && course.topics.length > 0) {
                expandedHeight += 12; // Topics line
              }
              cardHeight = expandedHeight;
            }

            const isHovered = hoveredCourseId === course.id;

            return (
              <React.Fragment key={course.id}>
                {/* Card base */}
                <Rect
                  x={centeredX}
                  y={course.y}
                  width={180}
                  height={cardHeight}
                  fill="#ffffff"
                  stroke={isHovered ? '#cbd5e1' : '#e5e7eb'}
                  strokeWidth={isHovered ? 2 : 1}
                  cornerRadius={12}
                  shadowColor="#0f172a"
                  shadowOpacity={isHovered ? 0.12 : 0.08}
                  shadowBlur={isHovered ? 12 : 8}
                  shadowOffsetX={0}
                  shadowOffsetY={isHovered ? 3 : 2}
                  onMouseEnter={() => setHoveredCourseId(course.id)}
                  onMouseLeave={() => setHoveredCourseId(null)}
                  onContextMenu={(e: any) => {
                    e.evt.preventDefault();
                    handleDeleteCourse(course.id);
                  }}
                />

                {/* Accent stripe - draggable handle */}
                <Rect
                  x={centeredX}
                  y={course.y}
                  width={6}
                  height={cardHeight}
                  fill={accent}
                  cornerRadius={12}
                  draggable
                  onDragStart={() => handleDragStart(course)}
                  onDragMove={handleDragMove}
                  onDragEnd={(e: any) => handleDragEnd(e, course.id)}
                />

                {/* Content */}
                <Text
                  x={centeredX + 16}
                  y={course.y + 10}
                  text={course.name}
                  fontSize={14}
                  fill="#0f172a"
                  fontStyle="bold"
                  width={150}
                />
                {/* Credits - under course name with wider margin */}
                <Text
                  x={centeredX + 16}
                  y={course.y + 44}
                  text={`Credits: ${course.credits}`}
                  fontSize={12}
                  fill="#64748b"
                />
                {/* Separator - after credits, moved closer to buttons */}
                <Rect
                  x={centeredX + 16}
                  y={course.y + 66}
                  width={130}
                  height={1}
                  fill="#e2e8f0"
                />

                {/* Expand/Collapse Button - closer to other buttons */}
                <Rect
                  x={centeredX + 150}
                  y={course.y + 70}
                  width={24}
                  height={24}
                  fill="#f0f4f8"
                  cornerRadius={6}
                />
                <Text
                  x={centeredX + 150}
                  y={course.y + 70}
                  text={isExpanded ? '▼' : '▶'}
                  fontSize={14}
                  fill="#2f80ed"
                  align="center"
                  width={24}
                  height={24}
                  verticalAlign="middle"
                  onClick={() => toggleCourseExpanded(course.id)}
                  onTap={() => toggleCourseExpanded(course.id)}
                />

                {/* Delete Icon - inside card with right margin */}
                <Rect
                  x={centeredX + 150}
                  y={course.y + 8}
                  width={24}
                  height={24}
                  fill="#fee2e2"
                  cornerRadius={6}
                />
                <Text
                  x={centeredX + 150}
                  y={course.y + 8}
                  text="✕"
                  fontSize={14}
                  fill="#dc2626"
                  align="center"
                  width={24}
                  height={24}
                  verticalAlign="middle"
                  onClick={() => handleDeleteCourse(course.id)}
                  onTap={() => handleDeleteCourse(course.id)}
                />

                {/* Edit Icon - closer to delete icon */}
                <Rect
                  x={centeredX + 150}
                  y={course.y + 36}
                  width={24}
                  height={24}
                  fill="#f0f4f8"
                  cornerRadius={6}
                />
                <Text
                  x={centeredX + 150}
                  y={course.y + 36}
                  text="✎"
                  fontSize={14}
                  fill="#2f80ed"
                  align="center"
                  width={24}
                  height={24}
                  verticalAlign="middle"
                  onClick={() => handleEditCourse(course)}
                  onTap={() => handleEditCourse(course)}
                />

                {/* Expandable Details Section - moved closer to buttons */}
                {isExpanded && (
                  <>
                    <Text
                      x={centeredX + 16}
                      y={course.y + 100}
                      text={`Type: ${getFullTypeName(course.type)}`}
                      fontSize={10}
                      fill="#64748b"
                    />
                    <Text
                      x={centeredX + 16}
                      y={course.y + 112}
                      text={`Sem: ${course.semester || 'N/A'}`}
                      fontSize={10}
                      fill="#64748b"
                    />
                    {course.topics && course.topics.length > 0 && (
                      <Text
                        x={centeredX + 16}
                        y={course.y + 124}
                        text={`Topics: ${course.topics.length}`}
                        fontSize={10}
                        fill="#64748b"
                      />
                    )}
                  </>
                )}
              </React.Fragment>
            );
          })}
        </Layer>
      </Stage>

      {/* Course Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.35)', zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CourseForm
            course={editingCourse}
            onSave={handleSaveCourse}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}
      
      {/* Login Form Modal */}
      {!isLoggedIn && !showLogin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.35)', zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoginForm
            onLogin={handleLogin}
            onRegister={handleRegister}
            onCancel={() => setShowLogin(true)}
          />
        </div>
      )}
    </div>
  );
};

export default App;
