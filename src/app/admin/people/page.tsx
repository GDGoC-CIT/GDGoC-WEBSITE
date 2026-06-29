'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { db, Person } from '@/lib/db';
import { 
  Search, Plus, Edit, Trash2, Camera, ArrowUp, ArrowDown,
  X, ShieldAlert, KeyRound, CheckCircle2, UserPlus, Upload, Settings
} from 'lucide-react';

const DEPARTMENTS = ['M.Sc.Software Systems','M.Sc.Data Science','M.Sc.Artificial Intelligence and Machine Learining','M.Sc.DCS','CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AIDS', 'AIML'];

const YEARS = ['I', 'II', 'III', 'IV', 'Staff'];

export default function PeopleAdminPage() {
  // Password Authentication State
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [authError, setAuthError] = useState('');

  // Hydration-safe auth init
  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem('gdg_people_admin_auth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Tab Manager State
  const [activeTab, setActiveTab] = useState<'list' | 'order'>('list');
  const [selectedAdminBatch, setSelectedAdminBatch] = useState('2026–27');
  const [batches, setBatches] = useState<string[]>(['2026–27', '2027–28', '2028–29']);

  // Dynamic Data States
  const [roles, setRoles] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);

  // Dashboard Data States
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Order Settings States
  const [orderedRoles, setOrderedRoles] = useState<string[]>([]);
  const [selectedOrderRole, setSelectedOrderRole] = useState('');
  const [orderRoleMembers, setOrderRoleMembers] = useState<Person[]>([]);

  // Form / Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  
  // Modals for Role, Badge, and Batch Management
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  // Batch Creation Fields
  const [startYear, setStartYear] = useState<string>('');
  const [endYear, setEndYear] = useState<string>('');

  // Role CRUD Fields
  const [editingRole, setEditingRole] = useState<any | null>(null);
  const [roleNameInput, setRoleNameInput] = useState('');

  // Badge CRUD Fields
  const [editingBadge, setEditingBadge] = useState<any | null>(null);
  const [badgeNameInput, setBadgeNameInput] = useState('');
  const [badgeColorInput, setBadgeColorInput] = useState('#1A73E8');
  const [badgeIconInput, setBadgeIconInput] = useState('');

  // Form Fields
  const [customId, setCustomId] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [batch, setBatch] = useState('2026–27');
  const [department, setDepartment] = useState('CSE');
  const [year, setYear] = useState('III');
  const [about, setAbout] = useState('');
  const [skillsText, setSkillsText] = useState(''); // Comma separated
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');

  const [isTeamLead, setIsTeamLead] = useState(false);
  const [memberBadges, setMemberBadges] = useState<string[]>([]);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  
  // Feedback Messages
  const [formFeedback, setFormFeedback] = useState({ type: '', msg: '' });
  const [slugError, setSlugError] = useState('');


  // Slug utility: generate slug from name
  const nameToSlug = (n: string) =>
    n.toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

  // Slug validator
  const validateSlug = (val: string, currentBatch: string, currentEditId?: string) => {
    if (!val) { setSlugError('URL ID is required.'); return false; }
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(val)) {
      setSlugError('Only lowercase letters, numbers, and hyphens allowed. Cannot start or end with a hyphen.');
      return false;
    }
    const dupe = people.find(p => p.batch === currentBatch && p.id === val);
    if (dupe && dupe.id !== currentEditId) {
      setSlugError(`“${val}” already exists in the ${currentBatch} batch. Choose a different ID.`);
      return false;
    }
    setSlugError('');
    return true;
  };

  // Fetch People Directory
  const loadPeople = async () => {
    setLoading(true);
    try {
      const data = await db.getPeople();
      setPeople(data);

      // Dynamic batch discovery:
      const uniqueBatches = Array.from(new Set(data.map(p => p.batch)));

      // Load saved batches from Supabase (falls back to localStorage)
      const savedBatchObjs = await db.getBatches();
      const savedBatchNames = savedBatchObjs.map(b => b.name);

      // Merge: static defaults + from people + from saved batches
      const combined = Array.from(new Set([
        ...['2026–27', '2027–28', '2028–29'],
        ...uniqueBatches,
        ...savedBatchNames
      ])).sort((a, b) => a.localeCompare(b));

      setBatches(combined);

      // Persist the merged list back to Supabase so new batches from people sync up
      const mergedBatchObjs = combined.map(name => ({ id: name, name }));
      await db.saveBatches(mergedBatchObjs);
    } catch (err) {
      console.error('Failed to load admin people database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadPeople();
  }, [isAuthenticated]);

  // Load roles & badges when selectedAdminBatch changes
  useEffect(() => {
    if (!isAuthenticated) return;
    async function loadBatchData() {
      try {
        const [loadedRoles, loadedBadges] = await Promise.all([
          db.getRoles(selectedAdminBatch),
          db.getBadges(selectedAdminBatch)
        ]);
        setRoles(loadedRoles);
        setBadges(loadedBadges);
      } catch (err) {
        console.error("Failed to load roles or badges for batch:", err);
      }
    }
    loadBatchData();
  }, [selectedAdminBatch, isAuthenticated]);


  // When name changes in add mode, auto-suggest slug unless admin already typed one
  useEffect(() => {
    if (!isModalOpen || editingPerson || slugManuallyEdited) return;
    if (name.trim()) {
      const suggested = nameToSlug(name);
      setCustomId(suggested);
      validateSlug(suggested, batch);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, isModalOpen, editingPerson, slugManuallyEdited]);

  // When batch changes in add mode, re-validate slug
  useEffect(() => {
    if (!isModalOpen || !customId) return;
    validateSlug(customId, batch, editingPerson?.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batch, isModalOpen]);

  // Load dynamic order settings data
  useEffect(() => {
    if (!isAuthenticated || activeTab !== 'order') return;
    async function loadOrderConfig() {
      try {
        const list = await db.getRoleOrder(selectedAdminBatch);
        setOrderedRoles(list);
        
        // Select first role by default
        if (list.length > 0) {
          if (!selectedOrderRole || !list.includes(selectedOrderRole)) {
            setSelectedOrderRole(list[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load roles order configuration:', err);
      }
    }
    loadOrderConfig();
  }, [isAuthenticated, activeTab, selectedAdminBatch]);

  // Filter and sort members belonging to selected role for ordering
  useEffect(() => {
    if (!isAuthenticated || activeTab !== 'order' || !selectedOrderRole) return;
    const members = people.filter(p => p.batch === selectedAdminBatch && p.role === selectedOrderRole);
    members.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    setOrderRoleMembers(members);
  }, [people, activeTab, selectedAdminBatch, selectedOrderRole, isAuthenticated]);

  // Auth Handler
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'gdgoccit') {
      setIsAuthenticated(true);
      setAuthError('');
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('gdg_people_admin_auth', 'true');
      }
    } else {
      setAuthError('Incorrect administration password. Please check and try again.');
    }
  };

  // Search Filter
  const filteredPeople = people.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.batch.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // File Upload Preview Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      alert("Image is too large. Please upload an image smaller than 1.5MB for storage.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Open Form for Adding New Member
  const handleOpenAddModal = () => {
    setEditingPerson(null);
    setCustomId('');
    setName('');
    setRole('');
    setBatch(selectedAdminBatch);
    setDepartment('CSE');
    setYear('III');
    setAbout('');
    setSkillsText('');
    setLinkedin('https://linkedin.com/in/');
    setGithub('https://github.com/');
    setPortfolio('');
    setWebsite('');
    setEmail('');
    setPhone('');
    setAvatar('');

    setIsTeamLead(false);
    setMemberBadges([]);
    setSlugManuallyEdited(false);
    setSlugError('');
    setFormFeedback({ type: '', msg: '' });
    setIsModalOpen(true);
  };

  // Open Form for Editing Existing Member
  const handleOpenEditModal = (person: Person) => {
    setEditingPerson(person);
    setCustomId(person.id);
    setName(person.name);
    setRole(person.role);
    setBatch(person.batch);
    setDepartment(person.department);
    setYear(person.year);
    setAbout(person.about || '');
    setSkillsText(person.skills ? person.skills.join(', ') : '');
    setLinkedin(person.linkedin || 'https://linkedin.com/in/');
    setGithub(person.github || 'https://github.com/');
    setPortfolio(person.portfolio || '');
    setWebsite(person.website || '');
    setEmail(person.email || '');
    setPhone(person.phone || '');
    setAvatar(person.avatar || '');

    setIsTeamLead(person.is_team_lead || false);
    setMemberBadges(person.badges || []);
    setFormFeedback({ type: '', msg: '' });
    setIsModalOpen(true);
  };


  // CRUD: Delete Member
  const handleDeletePerson = async (id: string, name: string) => {
    console.log("Admin UI: handleDeletePerson triggered for ID:", id, "Name:", name);
    if (!window.confirm(`Are you absolutely sure you want to delete core board member "${name}"?`)) {
      console.log("Admin UI: Delete cancelled by user confirm dialog");
      return;
    }
    try {
      console.log("Admin UI: calling db.deletePerson for ID:", id);
      await db.deletePerson(id);
      console.log("Admin UI: db.deletePerson call completed successfully, filtering local state people");
      setPeople(people.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete member:', err);
      alert('Failed to delete team member from database.');
    }
  };

  // CRUD: Clear all members in selected batch
  const handleClearBatch = async () => {
    const batchLabel = selectedAdminBatch;
    if (!window.confirm(`Delete ALL members in the "${batchLabel}" batch? This cannot be undone.`)) return;

    try {
      const toDelete = people.filter(p => p.batch === batchLabel);
      await Promise.all(toDelete.map(p => db.deletePerson(p.id)));
      setPeople(prev => prev.filter(p => p.batch !== batchLabel));
      alert(`✅ All members in "${batchLabel}" have been cleared.`);
    } catch (err) {
      console.error('Failed to clear batch:', err);
      alert('An error occurred while clearing the batch. Some members may not have been deleted.');
    }
  };

  // CRUD: Add / Update Member Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const idToUse = customId.trim();
    if (!idToUse || !name.trim() || !role.trim()) {
      setFormFeedback({ type: 'error', msg: 'URL ID, Full Name, and Role fields are required.' });
      return;
    }

    // Validate the Custom URL ID pattern
    if (!validateSlug(idToUse, batch, editingPerson?.id)) {
      setFormFeedback({ type: 'error', msg: 'Please resolve the Custom URL ID validation errors before saving.' });
      return;
    }

    // Verify Uniqueness of customId inside selected batch
    const dupe = people.find(p => p.id === idToUse && p.batch === batch);
    if (dupe && (!editingPerson || editingPerson.id !== idToUse)) {
      setFormFeedback({ type: 'error', msg: `This URL ID already exists in the ${batch} batch. Please choose another ID.` });
      return;
    }

    const skillsArray = skillsText
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const payload = {
      id: idToUse,
      name: name.trim(),
      role: role.trim(),
      batch,
      department,
      year,
      about: about.trim(),
      skills: skillsArray,
      linkedin: linkedin.trim(),
      github: github.trim(),
      portfolio: portfolio.trim() || undefined,
      website: website.trim() || undefined,
      email: email.trim(),
      phone: phone.trim() || undefined,
      avatar: avatar.trim(),

      is_team_lead: isTeamLead,
      badges: memberBadges
    };


    try {
      if (editingPerson) {
        // If the ID was modified, delete the old record and create the new one to prevent orphaned dynamic entries
        if (editingPerson.id !== idToUse) {
          await db.deletePerson(editingPerson.id);
          const created = await db.createPerson(payload);
          setPeople(people.map(p => p.id === editingPerson.id ? created : p));
        } else {
          const updated = await db.updatePerson(editingPerson.id, payload);
          setPeople(people.map(p => p.id === editingPerson.id ? updated : p));
        }
        setFormFeedback({ type: 'success', msg: `Successfully updated profile of ${name}.` });
      } else {
        const created = await db.createPerson(payload);
        setPeople([...people, created]);
        setFormFeedback({ type: 'success', msg: `Successfully registered new core board member: ${name}.` });
      }
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1000);
    } catch (err) {
      console.error('Failed to save team member data:', err);
      setFormFeedback({ type: 'error', msg: 'Failed to record details. Check data inputs.' });
    }
  };

  // Batch Creation Submit
  const handleCreateBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const start = parseInt(startYear, 10);
    const end = parseInt(endYear, 10);
    if (isNaN(start) || isNaN(end)) {
      alert("Please enter valid start and end years.");
      return;
    }
    if (end !== start + 1) {
      alert("End Year must be exactly Start Year + 1.");
      return;
    }
    const batchName = `${start}–${end.toString().slice(-2)}`;
    if (batches.includes(batchName)) {
      alert(`Batch "${batchName}" already exists.`);
      return;
    }
    const updated = [...batches, batchName].sort((a, b) => a.localeCompare(b));
    setBatches(updated);
    // Save to Supabase (and localStorage as fallback)
    await db.saveBatches(updated.map(name => ({ id: name, name })));
    setSelectedAdminBatch(batchName);
    setIsBatchModalOpen(false);
  };

  // Role CRUD Actions
  const handleAddRole = async () => {
    if (!roleNameInput.trim()) return;
    const newRole = {
      id: `${selectedAdminBatch.replace(/–/g, '-')}-${roleNameInput.trim().replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
      batch: selectedAdminBatch,
      name: roleNameInput.trim(),
      display_order: roles.length
    };
    const updated = [...roles, newRole];
    setRoles(updated);
    setRoleNameInput('');
    await db.saveRoles(selectedAdminBatch, updated);
    
    // Trigger orderedRoles refresh
    const list = await db.getRoleOrder(selectedAdminBatch);
    setOrderedRoles(list);
  };

  const handleDeleteRole = async (roleId: string) => {
    const updated = roles.filter(r => r.id !== roleId).map((r, idx) => ({ ...r, display_order: idx }));
    setRoles(updated);
    await db.saveRoles(selectedAdminBatch, updated);
    
    const list = await db.getRoleOrder(selectedAdminBatch);
    setOrderedRoles(list);
  };

  const handleEditRole = async (roleId: string, newName: string) => {
    const updated = roles.map(r => r.id === roleId ? { ...r, name: newName.trim() } : r);
    setRoles(updated);
    await db.saveRoles(selectedAdminBatch, updated);
    const list = await db.getRoleOrder(selectedAdminBatch);
    setOrderedRoles(list);
  };

  const handleMoveRoleItem = async (index: number, direction: 'up' | 'down') => {
    const nextIdx = direction === 'up' ? index - 1 : index + 1;
    if (nextIdx < 0 || nextIdx >= roles.length) return;
    const swapped = [...roles];
    const temp = swapped[index];
    swapped[index] = swapped[nextIdx];
    swapped[nextIdx] = temp;
    
    const ordered = swapped.map((r, idx) => ({ ...r, display_order: idx }));
    setRoles(ordered);
    await db.saveRoles(selectedAdminBatch, ordered);
    
    const list = await db.getRoleOrder(selectedAdminBatch);
    setOrderedRoles(list);
  };

  // Badge CRUD Actions
  const handleAddBadge = async () => {
    if (!badgeNameInput.trim()) return;
    const newBadge = {
      id: `badge-${Date.now()}`,
      batch: selectedAdminBatch,
      name: badgeNameInput.trim(),
      color: badgeColorInput,
      icon: badgeIconInput.trim() || undefined,
      display_order: badges.length
    };
    const updated = [...badges, newBadge];
    setBadges(updated);
    setBadgeNameInput('');
    setBadgeIconInput('');
    await db.saveBadges(selectedAdminBatch, updated);
  };

  const handleDeleteBadge = async (badgeId: string) => {
    const updated = badges.filter(b => b.id !== badgeId).map((b, idx) => ({ ...b, display_order: idx }));
    setBadges(updated);
    await db.saveBadges(selectedAdminBatch, updated);
  };

  const handleMoveBadgeItem = async (index: number, direction: 'up' | 'down') => {
    const nextIdx = direction === 'up' ? index - 1 : index + 1;
    if (nextIdx < 0 || nextIdx >= badges.length) return;
    const swapped = [...badges];
    const temp = swapped[index];
    swapped[index] = swapped[nextIdx];
    swapped[nextIdx] = temp;
    
    const ordered = swapped.map((b, idx) => ({ ...b, display_order: idx }));
    setBadges(ordered);
    await db.saveBadges(selectedAdminBatch, ordered);
  };

  // Reordering Role Sections

  const handleMoveRole = async (index: number, direction: 'up' | 'down') => {
    const nextIdx = direction === 'up' ? index - 1 : index + 1;
    if (nextIdx < 0 || nextIdx >= orderedRoles.length) return;

    const swapped = [...orderedRoles];
    const temp = swapped[index];
    swapped[index] = swapped[nextIdx];
    swapped[nextIdx] = temp;

    setOrderedRoles(swapped);
    await db.saveRoleOrder(selectedAdminBatch, swapped);
  };

  // Reordering Members inside Role
  const handleMoveMember = async (index: number, direction: 'up' | 'down') => {
    const nextIdx = direction === 'up' ? index - 1 : index + 1;
    if (nextIdx < 0 || nextIdx >= orderRoleMembers.length) return;

    const swapped = [...orderRoleMembers];
    const temp = swapped[index];
    swapped[index] = swapped[nextIdx];
    swapped[nextIdx] = temp;

    // Recalculate display order values
    swapped.forEach((member, idx) => {
      member.display_order = idx + 1;
    });

    setOrderRoleMembers(swapped);

    // Sync back with complete local state
    const peopleCopy = [...people];
    swapped.forEach(m => {
      const idx = peopleCopy.findIndex(p => p.id === m.id);
      if (idx !== -1) {
        peopleCopy[idx] = { ...peopleCopy[idx], display_order: m.display_order };
      }
    });
    setPeople(peopleCopy);

    // Save Display Orders to Database asynchronously
    await Promise.all(
      swapped.map(m => db.updatePerson(m.id, { display_order: m.display_order }))
    );
  };

  // ----------------------------------------------------
  // Gated Password Prompt Layout
  // ----------------------------------------------------

  // Render neutral spinner during SSR/hydration to prevent mismatch
  if (!mounted) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-gdg-blue border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white border border-gray-150 rounded-3xl shadow-md p-8 max-w-sm w-full text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gdg-blue via-gdg-red to-gdg-yellow" />
            
            <div className="w-14 h-14 bg-red-50 border border-red-200 text-gdg-red rounded-full flex items-center justify-center mx-auto mb-5">
              <KeyRound className="w-6 h-6 animate-pulse" />
            </div>

            <h2 className="text-xl font-extrabold text-gray-900 font-display">Administrative Security</h2>
            <p className="text-gray-550 text-xs mt-1.5 leading-relaxed max-w-xs mx-auto">
              Please enter the chapter database authentication password to access the member management console.
            </p>

            <form onSubmit={handleAuthSubmit} className="mt-6 space-y-4">
              <div>
                <input
                  type="password"
                  required
                  placeholder="Enter Access Password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-250 rounded-2xl text-sm focus:outline-none focus:border-gdg-blue text-center font-semibold animate-transition-all"
                />
              </div>

              {authError && (
                <div className="bg-red-50 border border-red-150 p-3.5 rounded-xl text-[11px] text-gdg-red font-semibold leading-normal flex items-start space-x-2 text-left">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-gdg-red" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-gdg-blue hover:bg-blue-700 text-white rounded-full text-xs font-bold tracking-wider uppercase transition-colors shadow-sm cursor-pointer"
              >
                Authenticate Console
              </button>
            </form>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  // ----------------------------------------------------
  // Dashboard Management Workspace Layout
  // ----------------------------------------------------
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        {/* Title Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 font-display tracking-tight flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-gdg-blue" />
              People Administration Console
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Add, edit, or remove board coordinators and advisors. Manage routing batches and displaying orders.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClearBatch}
              className="inline-flex items-center px-4 py-2 border border-red-300 text-xs font-bold rounded-full text-gdg-red bg-white hover:bg-red-50 transition-colors shadow-sm cursor-pointer"
              title={`Delete all members in the ${selectedAdminBatch} batch`}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Clear Batch
            </button>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold rounded-full text-white bg-gdg-blue hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Core Board Member
            </button>
          </div>
        </div>

        {/* Console Navigation Tab Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl border border-gray-200 self-start">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activeTab === 'list' 
                  ? 'bg-white text-gdg-blue shadow-xs border border-gray-150' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Members List
            </button>
            <button
              onClick={() => setActiveTab('order')}
              className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === 'order' 
                  ? 'bg-white text-gdg-blue shadow-xs border border-gray-150' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Display Order Settings
            </button>
          </div>

          {/* Batch Selector & Management Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Batch</span>
            <select
              value={selectedAdminBatch}
              onChange={(e) => setSelectedAdminBatch(e.target.value)}
              className="px-3 py-1.5 bg-white border border-gray-250 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:border-gdg-blue bg-white"
            >
              {batches.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            <button
              onClick={() => {
                setStartYear('');
                setEndYear('');
                setIsBatchModalOpen(true);
              }}
              className="inline-flex items-center px-3 py-1.5 border border-gray-250 text-xs font-bold rounded-xl text-gray-600 bg-white hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
              title="Create a new batch"
            >
              + Create Batch
            </button>

            <button
              onClick={() => setIsRoleModalOpen(true)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-250 text-xs font-bold rounded-xl text-gray-600 bg-white hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
              title="Manage roles for this batch"
            >
              Manage Roles
            </button>

            <button
              onClick={() => setIsBadgeModalOpen(true)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-250 text-xs font-bold rounded-xl text-gray-600 bg-white hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
              title="Manage badges for this batch"
            >
              Manage Badges
            </button>
          </div>
        </div>


        {/* ─── TAB 1: MEMBERS DIRECTORY LISTING ─── */}
        {activeTab === 'list' && (
          <>
            {/* Search Filter Header */}
            <div className="bg-white border border-gray-150 p-4 rounded-2xl shadow-2xs mb-6 flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search team member by name, role, department or batch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:border-gdg-blue"
                />
              </div>
              
              <div className="text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1.5 border border-gray-200 rounded-lg">
                Total Listing: {filteredPeople.filter(p => p.batch === selectedAdminBatch).length} Core Members
              </div>
            </div>

            {/* Database Table View */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center bg-white border border-gray-150 rounded-2xl shadow-2xs">
                <div className="w-10 h-10 border-4 border-gdg-blue border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Syncing members file...</p>
              </div>
            ) : filteredPeople.filter(p => p.batch === selectedAdminBatch).length === 0 ? (
              <div className="text-center py-20 bg-white border border-gray-150 rounded-2xl shadow-2xs">
                <p className="text-gray-550 text-sm font-semibold">No board members found matching selection.</p>
                <p className="text-gray-400 text-xs mt-1">Clear filters or click add to register a coordinator.</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-150 rounded-2xl shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-150">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Photo</th>
                        <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Member ID</th>
                        <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Role</th>
                        <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Department / Year</th>
                        <th scope="col" className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-150 text-xs text-gray-700">
                      {filteredPeople
                        .filter(p => p.batch === selectedAdminBatch)
                        .map((person) => (
                          <tr key={person.id} className="hover:bg-gray-50/50 transition-colors">
                            {/* Avatar */}
                            <td className="px-6 py-3.5 whitespace-nowrap">
                              <img
                                src={person.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                                alt={person.name}
                                className="w-10 h-10 rounded-full object-cover border border-gray-200 bg-gray-50"
                              />
                            </td>

                            {/* Member ID */}
                            <td className="px-6 py-3.5 whitespace-nowrap font-mono text-gray-600 font-semibold">
                              {person.id}
                            </td>

                            {/* Name */}
                            <td className="px-6 py-3.5 whitespace-nowrap font-bold text-gray-900">
                              <div className="flex items-center gap-1.5">
                                {person.name}

                                {person.is_team_lead && (
                                  <span className="px-1.5 py-0.5 text-[8px] font-extrabold bg-gdg-blue text-white rounded-full tracking-wider">
                                    LEAD
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Role */}
                            <td className="px-6 py-3.5 whitespace-nowrap font-semibold text-gray-500">
                              {person.is_team_lead && !['Faculty Advisor','Secretary','Joint Secretary','Treasurer'].includes(person.role)
                                ? person.role.replace(/\s*Team$/, ' Team Lead')
                                : person.role}
                            </td>

                            {/* Academic Detail */}
                            <td className="px-6 py-3.5 whitespace-nowrap text-gray-550">
                              {person.department} &bull; Year {person.year}
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-3.5 whitespace-nowrap text-right text-xs font-medium space-x-1.5">
                              <button
                                onClick={() => handleOpenEditModal(person)}
                                className="inline-flex items-center p-2 text-gdg-blue hover:bg-blue-50 border border-transparent hover:border-blue-150 rounded-lg transition-colors cursor-pointer"
                                title="Edit Profile"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={() => handleDeletePerson(person.id, person.name)}
                                className="inline-flex items-center p-2 text-gdg-red hover:bg-red-50 border border-transparent hover:border-red-150 rounded-lg transition-colors cursor-pointer"
                                title="Delete Member"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* ─── TAB 2: DISPLAY ORDER MANAGEMENT SETTINGS ─── */}
        {activeTab === 'order' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Panel 1: Team Section Ordering */}
            <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-2xs">
              <h3 className="text-sm font-extrabold text-gray-900 mb-2 font-display">Section Ordering</h3>
              <p className="text-[11px] text-gray-500 mb-6">
                Change how team segments stack vertically on the directory page. Top roles load first.
              </p>
              
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                {orderedRoles.map((roleName, idx) => (
                  <div 
                    key={roleName} 
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-gray-300 transition-all"
                  >
                    <span className="text-xs font-bold text-gray-800">{roleName}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleMoveRole(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-white text-gray-500 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveRole(idx, 'down')}
                        disabled={idx === orderedRoles.length - 1}
                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-white text-gray-500 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Panel 2: Member Ordering Inside Selection */}
            <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-2xs">
              <h3 className="text-sm font-extrabold text-gray-900 mb-2 font-display">Member Ordering</h3>
              <p className="text-[11px] text-gray-500 mb-4">
                Arrange display order of members belonging to a specific team.
              </p>

              {/* Selector dropdown for members panel */}
              <div className="mb-6">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Select Role Group</label>
                <select
                  value={selectedOrderRole}
                  onChange={(e) => setSelectedOrderRole(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-250 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-gdg-blue focus:ring-1 focus:ring-gdg-blue"
                >
                  {orderedRoles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Members listing */}
              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                {orderRoleMembers.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-xs text-gray-400 font-semibold">
                    No members registered under this role.
                  </div>
                ) : (
                  orderRoleMembers.map((member, idx) => (
                    <div 
                      key={member.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-gray-300 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={member.avatar || 'https://ui-avatars.com/api/?name=User'} 
                          className="w-7 h-7 rounded-full object-cover border border-gray-200 bg-white" 
                          alt="" 
                        />
                        <div>
                          <p className="text-xs font-bold text-gray-800 leading-tight">{member.name}</p>
                          <p className="text-[9px] text-gray-400 font-mono">ID: {member.id} &bull; Order: {member.display_order || idx + 1}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleMoveMember(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-white text-gray-500 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveMember(idx, 'down')}
                          disabled={idx === orderRoleMembers.length - 1}
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-white text-gray-500 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}
      </main>

      {/* ----------------------------------------------------
          Add / Edit Member Modal Dialog
          ---------------------------------------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-150 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-150 flex items-center justify-between bg-gray-50 rounded-t-3xl">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 font-display">
                  {editingPerson ? `Edit Core Member: ${editingPerson.name}` : 'Register Core Board Member'}
                </h3>
                <p className="text-[10px] text-gray-500">
                  Update database records. Ensure profile images uploaded are compressed.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-gray-150 rounded-lg cursor-pointer">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              
              {/* Image Preview and Uploader Row */}
              <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start p-4 bg-gray-50/50 border border-gray-150 rounded-2xl">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-250 bg-white flex-shrink-0 flex items-center justify-center group">
                  {avatar ? (
                    <img src={avatar} alt="Preview Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-gray-300" />
                  )}
                </div>

                <div className="flex-1 w-full space-y-3">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Photo Avatar</span>
                  
                  <div className="flex items-center gap-2">
                    <label className="px-4 py-2 border border-gray-250 rounded-full hover:bg-gray-50 text-[11px] font-bold text-gray-600 flex items-center gap-1.5 cursor-pointer shadow-2xs bg-white">
                      <Upload className="w-3.5 h-3.5 text-gray-400" />
                      Upload Photo
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handlePhotoUpload} 
                        className="hidden" 
                      />
                    </label>
                    
                    {avatar && (
                      <button
                        type="button"
                        onClick={() => setAvatar('')}
                        className="px-3 py-2 text-gdg-red hover:bg-red-50 text-[10px] font-bold rounded-full transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[9px] text-gray-400 leading-normal">
                    Square ratios are optimal. Photo size must not exceed 1.5MB.
                  </p>
                </div>
              </div>

              {/* Core Information Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Custom URL ID</label>
                  <input
                    type="text"
                    required
                    value={customId}
                    onChange={(e) => {
                      const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                      setCustomId(val);
                      setSlugManuallyEdited(true);
                      validateSlug(val, batch, editingPerson?.id);
                    }}
                    placeholder="e.g. hemmanth, raj-kishore"
                    className={`w-full px-4 py-2 border rounded-xl text-xs focus:outline-none font-mono font-bold transition-all ${
                      slugError ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-250 focus:border-gdg-blue focus:ring-1 focus:ring-gdg-blue'
                    }`}
                  />
                  {slugError ? (
                    <p className="text-[10px] text-red-500 font-semibold mt-1">
                      {slugError}
                    </p>
                  ) : (
                    <p className="text-[9px] text-gray-400 mt-1">
                      {editingPerson ? "Warning: changing this ID updates the profile URL." : "Auto-generated suggestion from name. Letters, numbers, hyphens only."}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Firstname Lastname"
                    className="w-full px-4 py-2 border border-gray-250 rounded-xl text-xs focus:outline-none focus:border-gdg-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Role Title</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-250 rounded-xl text-xs focus:outline-none focus:border-gdg-blue bg-white"
                    required
                  >
                    <option value="">-- Select Role --</option>
                    {roles.length > 0 ? (
                      roles.map(r => (
                        <option key={r.id} value={r.name}>{r.name}</option>
                      ))
                    ) : (
                      <option value="" disabled>No roles yet — add via Manage Roles</option>
                    )}
                  </select>

                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Batch Year</label>
                  <select
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-250 rounded-xl text-xs focus:outline-none focus:border-gdg-blue"
                  >
                    {batches.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}

                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Academic Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-250 rounded-xl text-xs focus:outline-none focus:border-gdg-blue bg-white"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Academic Year</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-250 rounded-xl text-xs focus:outline-none focus:border-gdg-blue bg-white"
                  >
                    {YEARS.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Biography Description</label>
                  <textarea
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    placeholder="Describe their contribution, interest, or background..."
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-250 rounded-xl text-xs focus:outline-none focus:border-gdg-blue resize-none"
                  />
                </div>
              </div>

              {/* Skills Tags */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Skills (Comma separated list)</label>
                <input
                  type="text"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  placeholder="e.g. Next.js, Python, UI Design, AWS, Docker"
                  className="w-full px-4 py-2 border border-gray-250 rounded-xl text-xs focus:outline-none focus:border-gdg-blue"
                />
              </div>

              {/* Contact Information & Channels */}
              <div className="border-t border-gray-150 pt-4 space-y-4">
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Connect Links & Channels</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">LinkedIn URL</label>
                    <input
                      type="url"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-3 py-1.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:border-gdg-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">GitHub URL</label>
                    <input
                      type="url"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="https://github.com/username"
                      className="w-full px-3 py-1.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:border-gdg-blue"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Official Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="username@cit.edu.in"
                      className="w-full px-3 py-1.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:border-gdg-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Phone (Optional)</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full px-3 py-1.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:border-gdg-blue"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Portfolio Link (Optional)</label>
                    <input
                      type="url"
                      value={portfolio}
                      onChange={(e) => setPortfolio(e.target.value)}
                      placeholder="https://myportfolio.dev"
                      className="w-full px-3 py-1.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:border-gdg-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Personal Website (Optional)</label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://mywebsite.com"
                      className="w-full px-3 py-1.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:border-gdg-blue"
                    />
                  </div>
                </div>

                {/* Badges Multi-Select Checkboxes */}
                <div className="pt-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Assign Badges</label>
                  {badges.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                      {badges.map(b => {
                        const isChecked = memberBadges.includes(b.id);
                        return (
                          <label key={b.id} className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-white rounded-lg transition-colors">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setMemberBadges([...memberBadges, b.id]);
                                } else {
                                  setMemberBadges(memberBadges.filter(id => id !== b.id));
                                }
                              }}
                              className="w-4 h-4 text-gdg-blue border-gray-250 rounded focus:ring-gdg-blue"
                            />
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border" style={{ borderColor: `${b.color}44`, backgroundColor: `${b.color}12`, color: b.color }}>
                              {b.name}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-400 italic">No custom badges defined for this batch yet. Create some using the "Manage Badges" button.</p>
                  )}
                  

                </div>


                {/* Team Lead Toggle - only for non-static roles */}
                {role.trim() && !['Faculty Advisor', 'Secretary', 'Joint Secretary', 'Treasurer'].includes(role.trim()) && (
                  <div className="mt-3 p-4 bg-blue-50 border border-blue-150 rounded-xl">
                    <p className="text-[10px] font-bold text-gdg-blue uppercase tracking-widest mb-3">Is Team Lead?</p>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="isTeamLead"
                          checked={!isTeamLead}
                          onChange={() => setIsTeamLead(false)}
                          className="w-4 h-4 text-gray-500"
                        />
                        <span className="text-xs font-semibold text-gray-600">No</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="isTeamLead"
                          checked={isTeamLead}
                          onChange={() => setIsTeamLead(true)}
                          className="w-4 h-4 text-gdg-blue"
                        />
                        <span className="text-xs font-semibold text-gdg-blue">Yes — display as &quot;{role.trim().replace(/\s*Team$/, ' Team Lead')}&quot;</span>
                      </label>
                    </div>
                    {isTeamLead && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold bg-gdg-blue text-white tracking-widest shadow-sm">
                        TEAM LEAD
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Feedback messages */}
              {formFeedback.msg && (
                <div className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
                  formFeedback.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-gdg-green' 
                    : 'bg-red-50 border border-red-200 text-gdg-red'
                }`}>
                  {formFeedback.type === 'success' && <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
                  {formFeedback.type === 'error' && <ShieldAlert className="w-4 h-4 flex-shrink-0" />}
                  <span className="font-semibold">{formFeedback.msg}</span>
                </div>
              )}

              {/* Footer Actions */}
              <div className="pt-4 border-t border-gray-150 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-gray-250 hover:bg-gray-50 rounded-full text-xs font-bold text-gray-600 cursor-pointer"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gdg-blue hover:bg-blue-700 text-white rounded-full text-xs font-bold shadow-sm elevation-1 cursor-pointer"
                >
                  Save Board Member
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ─── BATCH CREATION MODAL ─── */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-[400px] border border-gray-150 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-gray-150 flex justify-between items-center bg-gray-50">
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Create New Batch</h3>
              <button onClick={() => setIsBatchModalOpen(false)} className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateBatchSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Start Year</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 2025"
                  value={startYear}
                  onChange={(e) => {
                    setStartYear(e.target.value);
                    const parsed = parseInt(e.target.value, 10);
                    if (!isNaN(parsed)) setEndYear((parsed + 1).toString());
                  }}
                  className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-bold focus:outline-none focus:border-gdg-blue bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">End Year</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 2026"
                  value={endYear}
                  onChange={(e) => setEndYear(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-bold focus:outline-none focus:border-gdg-blue bg-white"
                />
              </div>
              <p className="text-[10px] text-gray-400 leading-normal">
                Batch will be generated in the format: <b>Start Year – End Year (Last two digits)</b>. Example: 2025–26.
              </p>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2 border border-gray-250 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gdg-blue hover:bg-blue-700 text-white rounded-full text-xs font-bold shadow-sm"
                >
                  Create Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── ROLE MANAGEMENT MODAL ─── */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-[500px] border border-gray-150 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-gray-150 flex justify-between items-center bg-gray-50 flex-shrink-0">
              <div>
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Manage Roles</h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Batch: {selectedAdminBatch}</p>
              </div>
              <button onClick={() => setIsRoleModalOpen(false)} className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Add Role Form */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter role name (e.g. AI Lead)"
                  value={roleNameInput}
                  onChange={(e) => setRoleNameInput(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-250 rounded-xl text-xs focus:outline-none focus:border-gdg-blue font-bold bg-white"
                />
                <button
                  onClick={handleAddRole}
                  className="px-4 py-2 bg-gdg-blue hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex-shrink-0"
                >
                  Add Role
                </button>
              </div>

              {/* Roles List */}
              <div className="space-y-2 mt-4">
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Current Roles ({roles.length})</span>
                {roles.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No custom roles defined. Using defaults.</p>
                ) : (
                  <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-150">
                    {roles.map((r, index) => (
                      <div key={r.id} className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 transition-colors">
                        <span className="text-xs font-bold text-gray-700">{r.name}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleMoveRoleItem(index, 'up')}
                            disabled={index === 0}
                            className="p-1 hover:bg-gray-100 disabled:opacity-30 rounded text-gray-500"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveRoleItem(index, 'down')}
                            disabled={index === roles.length - 1}
                            className="p-1 hover:bg-gray-100 disabled:opacity-30 rounded text-gray-500"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              const newName = prompt("Edit Role Name:", r.name);
                              if (newName) handleEditRole(r.id, newName);
                            }}
                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-[10px] font-bold text-gray-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete role "${r.name}"?`)) handleDeleteRole(r.id);
                            }}
                            className="p-1 hover:bg-red-50 text-gdg-red rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-150 bg-gray-50 flex justify-end flex-shrink-0">
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="px-5 py-2.5 bg-gray-700 hover:bg-gray-800 text-white rounded-full text-xs font-bold shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── BADGE MANAGEMENT MODAL ─── */}
      {isBadgeModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-[500px] border border-gray-150 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-gray-150 flex justify-between items-center bg-gray-50 flex-shrink-0">
              <div>
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Manage Badges</h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Batch: {selectedAdminBatch}</p>
              </div>
              <button onClick={() => setIsBadgeModalOpen(false)} className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Add Badge Form */}
              <div className="bg-gray-50 p-4 border border-gray-200 rounded-2xl space-y-3">
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Add New Badge</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Badge Name (e.g. Speaker)"
                    value={badgeNameInput}
                    onChange={(e) => setBadgeNameInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-250 rounded-xl text-xs focus:outline-none focus:border-gdg-blue font-bold bg-white"
                  />
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={badgeColorInput}
                      onChange={(e) => setBadgeColorInput(e.target.value)}
                      className="w-10 h-8 border border-gray-250 rounded-xl cursor-pointer p-0 bg-transparent flex-shrink-0"
                    />
                    <input
                      type="text"
                      placeholder="Icon Name (e.g. Star)"
                      value={badgeIconInput}
                      onChange={(e) => setBadgeIconInput(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-250 rounded-xl text-xs focus:outline-none focus:border-gdg-blue bg-white"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddBadge}
                  className="w-full py-2 bg-gdg-blue hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Create Badge
                </button>
              </div>

              {/* Badges List */}
              <div className="space-y-2 mt-4">
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Current Badges ({badges.length})</span>
                {badges.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No custom badges defined yet.</p>
                ) : (
                  <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-150">
                    {badges.map((b, index) => (
                      <div key={b.id} className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border" style={{ borderColor: `${b.color}44`, backgroundColor: `${b.color}12`, color: b.color }}>
                            {b.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleMoveBadgeItem(index, 'up')}
                            disabled={index === 0}
                            className="p-1 hover:bg-gray-100 disabled:opacity-30 rounded text-gray-500"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveBadgeItem(index, 'down')}
                            disabled={index === badges.length - 1}
                            className="p-1 hover:bg-gray-100 disabled:opacity-30 rounded text-gray-500"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBadge(b.id)}
                            className="p-1 hover:bg-red-50 text-gdg-red rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-150 bg-gray-50 flex justify-end flex-shrink-0">
              <button
                onClick={() => setIsBadgeModalOpen(false)}
                className="px-5 py-2.5 bg-gray-700 hover:bg-gray-800 text-white rounded-full text-xs font-bold shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

