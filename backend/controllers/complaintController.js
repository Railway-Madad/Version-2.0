const {cloudinary} = require('../config/cloudinary');
const Complaint = require('../models/ComplaintModel');
const fs = require('fs').promises;

// GET /complaint - Render the complaint form
exports.getComplaintForm = (req, res) => {
    const currentUser = req.session?.user?.username || null;
    res.render('complaint', { 
        currentUser,
        success: req.query.success || false,
        error: req.query.error || false
    });
};

// pOST /complaint/submit-complaint 
exports.postComplaint = async (req, res) => {
    try {
        const { username, pnr, description, issueDomain } = req.body;
        const file = req.file;

        if (!username || !pnr || !description || !issueDomain) {
            if (file) await fs.unlink(file.path).catch(err => console.error('Error deleting temp file:', err));
            return res.redirect('/complaint?error=true&message=All fields are required');
        }

        let linkurl = null;
        if (file) {
            if (!cloudinary || !cloudinary.uploader) {
                await fs.unlink(file.path).catch(err => console.error('Error deleting temp file:', err));
                throw new Error('Cloudinary is not initialized');
            }
            // verify file exists
            try {
                await fs.access(file.path);
                console.log('Uploading file:', file.path);
            } catch (err) {
                await fs.unlink(file.path).catch(e => console.error('Error deleting temp file:', e));
                throw new Error(`File not found: ${file.path}`);
            }
            try {
                const uploadResult = await cloudinary.uploader.upload(file.path, {
                    folder: 'railmadad/complaints',
                    public_id: `complaint_${Date.now()}`,
                    resource_type: 'image'
                });
                linkurl = uploadResult.secure_url;
                console.log('Cloudinary upload successful:', linkurl);
                await fs.unlink(file.path).catch(err => console.error('Error deleting temp file:', err));
            } catch (uploadError) {
                await fs.unlink(file.path).catch(err => console.error('Error deleting temp file:', err));
                console.error('Cloudinary upload error:', {
                    message: uploadError.message,
                    http_code: uploadError.http_code,
                    stack: uploadError.stack
                });
                throw new Error(`Failed to upload image to Cloudinary: ${uploadError.message}`);
            }
        }

        const complaint = new Complaint({
            username,
            pnr,
            description,
            issueDomain,
            linkurl,
            status: 'Pending'
        });

        await complaint.save();
        res.redirect('/complaint?success=true');
    } catch (error) {
        console.error('Error submitting complaint:', {
            message: error.message,
            stack: error.stack
        });
        if (req.file) await fs.unlink(req.file.path).catch(err => console.error('Error deleting temp file:', err));
        res.redirect(`/complaint?error=true&message=${encodeURIComponent(error.message)}`);
    }
};

//get all get requests
exports.getPaginatedComplaints = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = 5;
    try {
        const totalComplaints = await Complaint.countDocuments();
        const totalPages = Math.ceil(totalComplaints / itemsPerPage);
        const complaints = await Complaint.find()
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage);
        res.json({
            staffName: 'Railway Staff',
            complaints,
            currentPage: page,
            totalPages
        });
    } catch (error) {
        console.error('Error loading paginated complaints:', error);
        res.status(500).json({
            staffName: 'Railway Staff',
            complaints: [],
            currentPage: 1,
            totalPages: 1,
            error: 'Server error'
        });
    }
};

//get all 
// GET /complaints/all - Get all complaints
exports.getAllComplaints = async (req, res) => {



    try {


        const complaints = await Complaint.find().sort({ createdAt: -1 });


        console.log('Fetched all complaints:', complaints.length); // Debug log


        res.json({ complaints });


    } catch (error) {


        console.error('Error fetching all complaints:', error);


        res.status(500).json({ complaints: [], error: error.message });


    }


};

// GET /complaint/:id - Get complaint by ID
exports.getComplaintById = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }
        res.json(complaint);
    } catch (error) {
        console.error('Error getting complaint:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// DELETE /complaint/:id - Delete a complaint
exports.deleteComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        // Ensure only the owner can delete
        const currentUser = req.session?.user?.username;
        if (!currentUser || complaint.username !== currentUser) {
            return res.status(403).json({ error: 'Unauthorized to delete this complaint' });
        }

        await Complaint.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'Complaint deleted successfully' });
    } catch (error) {
        console.error('Error deleting complaint:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// PUT /complaint/resolve/:id - Resolve a complaint
exports.resolveComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            {
                status: 'Resolved',
                resolvedAt: Date.now(),
                resolutionDetails: req.body.resolutionDetails || '',
                resolutionCategory: req.body.resolutionCategory || ''
            },
            { new: true }
        );

        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        res.json(complaint);
    } catch (error) {
        console.error('Error resolving complaint:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET /complaints/user/:username - Get all complaints by username
exports.getComplaintsByUser = async (req, res) => {
    try {
        const complaints = await Complaint.find({ username: req.params.username });
        res.json(complaints);
    } catch (error) {
        console.error('Error getting complaints by user:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// PUT /complaint/resolve/:id - Resolve a complaint
exports.resolveComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            {
                status: 'Resolved',
                resolvedAt: Date.now(),
                resolutionDetails: req.body.resolutionDetails || '',
                resolutionCategory: req.body.resolutionCategory || ''
            },
            { new: true }
        );

        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        res.json(complaint);
    } catch (error) {
        console.error('Error resolving complaint:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET /complaints?page=1 - Paginated complaints (for staff dashboard)
exports.getPaginatedComplaints = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = 5;

    try {
        const totalComplaints = await Complaint.countDocuments();
        const totalPages = Math.ceil(totalComplaints / itemsPerPage);

        const complaints = await Complaint.find()
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage);

        res.render('staff_dashboard', {
            staffName: 'Railway Staff',
            complaints,
            currentPage: page,
            totalPages
        });
    } catch (error) {
        console.error('Error loading paginated complaints:', error);
        res.render('staff_dashboard', {
            staffName: 'Railway Staff',
            complaints: [],
            currentPage: 1,
            totalPages: 1
        });
    }
};

// GET /complaint/upload-image - Render image upload form
exports.getUploadForm = (req, res) => {
    const currentUser = req.session?.user?.username || null;
    res.render('upload-image', {
        currentUser,
        success: req.query.success || false,
        error: req.query.error || false
    });
};

// POST /complaint/upload-image - Handle standalone image upload
exports.postImage = async (req, res) => {
    try {
        const { username } = req.body;
        const file = req.file;

        if (!username || !file) {
            if (file) await fs.unlink(file.path).catch(err => console.error('Error deleting temp file:', err));
            return res.redirect('/complaint/upload-image?error=true&message=Missing username or image');
        }

        if (!cloudinary || !cloudinary.uploader) {
            await fs.unlink(file.path).catch(err => console.error('Error deleting temp file:', err));
            throw new Error('Cloudinary is not initialized');
        }

        let linkurl;
        try {
            // Verify file exists
            await fs.access(file.path);
            console.log('Uploading file:', file.path);
            const uploadResult = await cloudinary.uploader.upload(file.path, {
                folder: 'railmadad/complaints',
                public_id: `complaint_image_${Date.now()}`,
                resource_type: 'image'
            });
            linkurl = uploadResult.secure_url;
            console.log('Cloudinary upload successful:', linkurl);
            await fs.unlink(file.path).catch(err => console.error('Error deleting temp file:', err));
        } catch (uploadError) {
            await fs.unlink(file.path).catch(err => console.error('Error deleting temp file:', err));
            console.error('Cloudinary upload error:', {
                message: uploadError.message,
                http_code: uploadError.http_code,
                stack: uploadError.stack
            });
            throw new Error(`Failed to upload image to Cloudinary: ${uploadError.message}`);
        }

        const complaint = new Complaint({
            username,
            pnr: 'N/A',
            description: 'Image-only complaint',
            issueDomain: 'Other',
            linkurl,
            status: 'Pending'
        });
        await complaint.save();

        res.redirect('/complaint/upload-image?success=true');
    } catch (error) {
        console.error('Error uploading image:', {
            message: error.message,
            stack: error.stack
        });
        if (req.file) await fs.unlink(req.file.path).catch(err => console.error('Error deleting temp file:', err));
        res.redirect(`/complaint/upload-image?error=true&message=${encodeURIComponent(error.message)}`);
    }
};

// GET /complaint/api/images/user/:username - Get complaints with images by username
exports.getImagesByUser = async (req, res) => {
    try {
        const complaints = await Complaint.find({ 
            username: req.params.username,
            linkurl: { $ne: null }
        });
        res.json(complaints);
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ error: 'Server error' });
    }
};