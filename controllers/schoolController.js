const pool = require('../config/db');
const calculateDistance = require('../utils/calculateDistance');

exports.addSchool = async (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  if (!name || !address || typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
      [name, address, latitude, longitude]
    );
    res.status(201).json({ message: 'School added successfully', id: result.insertId });
  } catch (error) {
    console.error('Error inserting school:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

// exports.listSchools = async (req, res) => {
//   const userLat = parseFloat(req.query.latitude);
//   const userLon = parseFloat(req.query.longitude);

//   if (isNaN(userLat) || isNaN(userLon)) {
//     return res.status(400).json({ error: 'Invalid coordinates' });
//   }

//   try {
//     const [schools] = await pool.query('SELECT * FROM schools');

//     const sortedSchools = schools
//       .map(school => ({
//         ...school,
//         distance: calculateDistance(userLat, userLon, school.latitude, school.longitude)
//       }))
//       .sort((a, b) => a.distance - b.distance);

//     res.json(sortedSchools);
//   } catch (error) {
//     console.error('Error fetching schools:', error);
//     res.status(500).json({ error: 'Database error' });
//   }
// };


// Haversine formula
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // returns distance in km
};

exports.listSchools = async (req, res) => {
  const userLat = parseFloat(req.query.latitude);
  const userLon = parseFloat(req.query.longitude);
  const limit = parseInt(req.query.limit) || 10; // Default to 10 if no limit provided
  const offset = parseInt(req.query.offset) || 0; // Default to 0 if no offset provided

  if (isNaN(userLat) || isNaN(userLon)) {
    return res.status(400).json({ error: 'Invalid coordinates' });
  }

  try {
    // Query schools and calculate distance in SQL
    const query = `
      SELECT id, name, latitude, longitude,
        ( 6371 * acos( cos( radians(?) ) * cos( radians(latitude) ) 
        * cos( radians(longitude) - radians(?) ) + sin( radians(?) ) 
        * sin( radians(latitude)) ) ) AS distance
      FROM schools
      HAVING distance <= 50  -- Optional: Limit to schools within 50 km
      ORDER BY distance
      LIMIT ? OFFSET ?
    `;

    // Execute the query with user's coordinates, limit, and offset
    const [schools] = await pool.query(query, [userLat, userLon, userLat, limit, offset]);

    if (schools.length === 0) {
      return res.status(404).json({ message: 'No schools found within the specified range.' });
    }

    // Optionally, if you want to add distance to each school (if not in query):
    const schoolsWithDistance = schools.map(school => ({
      ...school,
      distance: haversineDistance(userLat, userLon, school.latitude, school.longitude),
    }));

    res.json(schoolsWithDistance);
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({ error: 'Database error' });
  }
};
