/**
 * Utility functions to transform MongoDB data to frontend-friendly format
 * MongoDB uses _id but frontend expects id for consistency
 */

/**
 * Transform a single document from MongoDB format to frontend format
 * @param {Object} doc - MongoDB document
 * @returns {Object} Transformed document with id field
 */
export const transformDocument = (doc) => {
  if (!doc) return doc;
  
  const transformed = {
    ...doc,
    id: doc._id || doc.id
  };
  
  // Handle nested objects that might have _id
  if (doc.assignedTo && typeof doc.assignedTo === 'object') {
    transformed.assignedTo = {
      ...doc.assignedTo,
      id: doc.assignedTo._id || doc.assignedTo.id
    };
  }
  
  if (doc.owner && typeof doc.owner === 'object') {
    transformed.owner = {
      ...doc.owner,
      id: doc.owner._id || doc.owner.id
    };
  }
  
  // Handle arrays of objects (like members)
  if (doc.members && Array.isArray(doc.members)) {
    transformed.members = doc.members.map(member => ({
      ...member,
      id: member._id || member.id
    }));
  }
  
  return transformed;
};

/**
 * Transform an array of documents from MongoDB format to frontend format
 * @param {Array} docs - Array of MongoDB documents
 * @returns {Array} Transformed array of documents with id field
 */
export const transformDocuments = (docs) => {
  if (!Array.isArray(docs)) return docs;
  return docs.map(transformDocument);
};

/**
 * Get the ID from a document, handling both MongoDB _id and frontend id
 * @param {Object} doc - Document with either _id or id
 * @returns {String} The document ID
 */
export const getDocumentId = (doc) => {
  if (!doc) return null;
  return doc._id || doc.id;
};
