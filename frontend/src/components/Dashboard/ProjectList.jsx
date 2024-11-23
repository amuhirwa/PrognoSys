import React from 'react';
import { FiMoreVertical } from 'react-icons/fi';
import './ProjectList.css';

const ProjectList = ({ projects }) => {
  const getStatusColor = (status) => {
    const colors = {
      ongoing: '#ffc107',
      completed: '#28a745',
      delayed: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  return (
    <div className="project-list">
      <div className="project-list-header">
        <h2>Projects Status</h2>
        <button className="view-all-btn">View all</button>
      </div>

      <div className="project-items">
        {projects?.map((project) => (
          <div key={project.id} className="project-item">
            <div className="project-info">
              <div className="project-title-row">
                <h3>{project.name}</h3>
                <div className="project-actions">
                  <button className="action-btn">
                    <FiMoreVertical />
                  </button>
                </div>
              </div>
              
              <div className="project-meta">
                <span className="assigned-to">
                  {project.assigned_to.username}
                </span>
                <span className="due-date">
                  Due: {new Date(project.due_date).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="project-progress">
              <div className="progress-stats">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${project.progress}%`,
                    backgroundColor: getStatusColor(project.status)
                  }}
                />
              </div>
              <span 
                className="project-status"
                style={{ color: getStatusColor(project.status) }}
              >
                {project.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectList; 