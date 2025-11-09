import React, { useState, useEffect, useMemo } from 'react';
import { Position, Candidate, Voter, Vote, ElectionStatus, Workspace, DEFAULT_USER_IMAGE, AuditLogEntry, AuditLogAction } from './types';
import AdminPanel from './components/AdminPanel';
import VotingBooth from './components/VotingBooth';
import ResultsChart from './components/ResultsChart';
import { UserIcon, LockIcon, IdentificationIcon, SunIcon, MoonIcon, ChartBarIcon, ShieldCheckIcon, TrophyIcon } from './components/icons';
import WorkspaceManager from './components/WorkspaceManager';
import SuperAdminPanel from './components/SuperAdminPanel';
import VoterVerificationModal from './components/VoterVerificationModal';
import VotedScreen from './components/VotedScreen';
import ReactConfetti from 'react-confetti';

type AppState = 'WORKSPACE_SELECT' | 'LOGIN' | 'ADMIN_VIEW' | 'VOTER_VIEW' | 'VOTED_SCREEN' | 'PUBLIC_RESULTS' | 'SUPER_ADMIN_VIEW';
type Theme = 'light' | 'dark';

export interface AdminProfile {
    id: string;
    name: string;
    password: string;
    imageUrl: string;
    contact: string;
}

// --- Reusable Theme Toggle Button ---
const ThemeToggleButton: React.FC<{ theme: Theme, toggleTheme: () => void }> = ({ theme, toggleTheme }) => (
    <button
        onClick={toggleTheme}
        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Toggle theme"
    >
        {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
    </button>
);

// --- Unified Login Screen ---
const UnifiedLoginScreen: React.FC<{
    onLogin: (id: string, pass: string) => void;
    loginError: string | null;
    theme: Theme;
    toggleTheme: () => void;
    electionStatus: ElectionStatus;
    resultsPublished: boolean;
    onViewResults: () => void;
    workspace: Workspace | null;
    onSwitchWorkspace: () => void;
    setShowVoterVerification: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ onLogin, loginError, theme, toggleTheme, electionStatus, resultsPublished, onViewResults, workspace, onSwitchWorkspace, setShowVoterVerification }) => {
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(loginId, password);
    };

    const resultsButtonState = useMemo(() => {
        if (electionStatus === 'ENDED' && resultsPublished) {
            return { disabled: false, text: "View Final Results" };
        }
        return null; // Don't show the button otherwise
    }, [electionStatus, resultsPublished]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 transition-colors">
            <div className="absolute top-4 right-4">
                <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
            </div>
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-6">
                 <div>
                    <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-200">
                        {workspace ? workspace.name : "Election System Login"}
                    </h2>
                    <p className="text-center text-gray-500 dark:text-gray-400">
                        {workspace ? "Election Portal" : "Voter, Admin & Super Admin"}
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Login ID</label>
                        <div className="mt-1 relative">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><UserIcon className="h-5 w-5 text-gray-400" /></div>
                            <input
                                type="text"
                                value={loginId}
                                onChange={(e) => setLoginId(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                placeholder="Enter your ID"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <div className="mt-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><LockIcon className="h-5 w-5 text-gray-400" /></div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                placeholder="Enter password"
                                required
                            />
                        </div>
                         <div className="text-right mt-2">
                            <button type="button" onClick={() => setShowVoterVerification(true)} className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                Find My Voter ID?
                            </button>
                        </div>
                    </div>
                    <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Login
                    </button>
                </form>
                {loginError && <p className="text-center text-sm text-red-600">{loginError}</p>}
                <div className="text-center border-t dark:border-gray-700 pt-6 space-y-4">
                     <button onClick={onSwitchWorkspace} className="w-full text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                        {workspace ? `Not ${workspace.name}? Switch Workspace` : 'Select Workspace to vote'}
                    </button>
                    {resultsButtonState && (
                        <button
                            onClick={onViewResults}
                            disabled={resultsButtonState.disabled}
                            className="inline-flex items-center gap-2 w-full justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                           <ChartBarIcon className="w-5 h-5"/> {resultsButtonState.text}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

interface PublicResultsProps {
    positions: Position[];
    candidates: Candidate[];
    votes: Vote[];
    onBack: () => void;
    theme: Theme;
    toggleTheme: () => void;
    workspaceName: string;
    electionStatus: ElectionStatus;
    resultsPublished: boolean;
}

const PublicResults: React.FC<PublicResultsProps> = ({ positions, candidates, votes, onBack, theme, toggleTheme, workspaceName, electionStatus, resultsPublished }) => {
    const voteCounts = useMemo(() => {
        const counts: { [key: number]: number } = {};
        candidates.forEach(c => counts[c.id] = 0);
        votes.forEach(vote => {
            if (counts[vote.candidateId] !== undefined) {
                counts[vote.candidateId]++;
            }
        });
        return counts;
    }, [votes, candidates]);

    const resultsData = useMemo(() => {
        return positions.map(position => {
            const positionCandidates = candidates
                .filter(c => c.positionId === position.id)
                .map(c => ({ name: c.name, votes: voteCounts[c.id] || 0, imageUrl: c.imageUrl }))
                .sort((a, b) => b.votes - a.votes);
            return {
                positionName: position.name,
                candidates: positionCandidates,
                winner: positionCandidates.length > 0 ? positionCandidates[0] : null
            };
        });
    }, [positions, candidates, voteCounts]);

    if (electionStatus === 'ENDED' && resultsPublished) {
        return (
            <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8 diwali-theme overflow-hidden">
                <ReactConfetti recycle={false} numberOfPieces={400} />
                 <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-bold text-yellow-300">{workspaceName}</h1>
                        <h2 className="text-2xl font-semibold text-yellow-200">Election Results Announcement</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
                        <button onClick={onBack} className="px-4 py-2 bg-yellow-500/20 border border-yellow-400 text-yellow-300 rounded-lg hover:bg-yellow-500/40">
                            &larr; Back
                        </button>
                    </div>
                </header>
                <div className="space-y-12">
                    {resultsData.map(data => (
                         <div key={data.positionName} className="text-center">
                            <h3 className="text-2xl font-semibold text-yellow-200 mb-2">The new <span className="font-bold text-yellow-100">{data.positionName}</span> is</h3>
                             {data.winner ? (
                                <div className="max-w-md mx-auto bg-slate-800/50 border-2 border-yellow-500 rounded-xl p-8 shadow-lg shadow-yellow-500/10">
                                    <img src={data.winner.imageUrl} alt={data.winner.name} className="w-32 h-32 rounded-full mx-auto mb-4 ring-4 ring-yellow-400 object-cover" />
                                    <p className="text-4xl font-bold text-yellow-300">{data.winner.name}</p>
                                    <p className="text-xl text-yellow-400 mt-2 flex items-center justify-center gap-2">
                                        <TrophyIcon className="w-6 h-6"/> With {data.winner.votes} Votes
                                    </p>
                                </div>
                             ) : (
                                <p className="text-xl text-yellow-300">No winner declared.</p>
                             )}
                         </div>
                    ))}
                </div>
                 <footer className="text-center mt-16">
                    <p className="text-yellow-200 font-bold text-2xl">Congratulations to all the winners!</p>
                </footer>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
             <div className="absolute top-4 right-4">
                <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
            </div>
            <div className="text-center bg-white dark:bg-gray-800 p-12 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Results Not Yet Published</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    The election has concluded. Final results will be available here once published by the administrator.
                </p>
                <button onClick={onBack} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    &larr; Back to Login
                </button>
            </div>
        </div>
    );
};


const App: React.FC = () => {
    // --- STATE MANAGEMENT ---
    const [theme, setTheme] = useState<Theme>('light');
    const [appState, setAppState] = useState<AppState>('LOGIN');
    const [loginError, setLoginError] = useState<string | null>(null);
    
    // Multi-workspace state
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);

    // Workspace-specific state
    const [positions, setPositions] = useState<Position[]>([]);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [voters, setVoters] = useState<Voter[]>([]);
    const [votes, setVotes] = useState<Vote[]>([]);
    const [electionStatus, setElectionStatus] = useState<ElectionStatus>('NOT_STARTED');
    const [electionEndTime, setElectionEndTime] = useState<number | null>(null);
    const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
    const [resultsPublished, setResultsPublished] = useState<boolean>(false);

    // Logged-in user state
    const [loggedInAdmin, setLoggedInAdmin] = useState<AdminProfile | null>(null);
    const [loggedInVoter, setLoggedInVoter] = useState<Voter | null>(null);
    const [loggedInSuperAdmin, setLoggedInSuperAdmin] = useState<AdminProfile | null>(null);

    // Workspace-specific Admin Profile
    const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
    
    // Super Admin Profile
    const [superAdminProfile, setSuperAdminProfile] = useState<AdminProfile>({ id: 'superadmin', name: 'Super Admin', password: 'super123', imageUrl: DEFAULT_USER_IMAGE, contact: '' });
    
    // Modal State
    const [showVoterVerification, setShowVoterVerification] = useState(false);

    // --- EFFECTS ---

    // Theme initialization
    useEffect(() => {
        const savedTheme = localStorage.getItem('election_theme') as Theme;
        if (savedTheme) {
            setTheme(savedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
        }
    }, []);

    // Load workspaces from local storage on mount
    useEffect(() => {
        const savedWorkspaces = localStorage.getItem('election_workspaces');
        if (savedWorkspaces) {
            setWorkspaces(JSON.parse(savedWorkspaces));
        }

        const lastWorkspaceId = localStorage.getItem('election_last_workspace_id');
        if (lastWorkspaceId && savedWorkspaces) {
             const lastWs = JSON.parse(savedWorkspaces).find((ws: Workspace) => ws.id === lastWorkspaceId);
             if (lastWs) {
                setActiveWorkspace(lastWs);
             }
        }
        
        const savedSuperAdminProfile = localStorage.getItem('election_superAdminProfile');
        if(savedSuperAdminProfile) {
            setSuperAdminProfile(JSON.parse(savedSuperAdminProfile));
        } else {
            localStorage.setItem('election_superAdminProfile', JSON.stringify(superAdminProfile));
        }

    }, []);

    // Load workspace data when activeWorkspace changes
    useEffect(() => {
        if (!activeWorkspace) {
            // Clear workspace-specific data when no workspace is active
            setPositions([]);
            setCandidates([]);
            setVoters([]);
            setVotes([]);
            setElectionStatus('NOT_STARTED');
            setElectionEndTime(null);
            setAdminProfile(null);
            setAuditLog([]);
            setResultsPublished(false);
            return;
        }

        const loadData = <T,>(key: string, setter: React.Dispatch<React.SetStateAction<T>>, defaultValue: T) => {
            const savedData = localStorage.getItem(`ws_${activeWorkspace.id}_${key}`);
            setter(savedData ? JSON.parse(savedData) : defaultValue);
        };
        
        loadData<Position[]>('positions', setPositions, []);
        loadData<Candidate[]>('candidates', setCandidates, []);
        loadData<Voter[]>('voters', setVoters, []);
        loadData<Vote[]>('votes', setVotes, []);
        loadData<ElectionStatus>('electionStatus', setElectionStatus, 'NOT_STARTED');
        loadData<number | null>('electionEndTime', setElectionEndTime, null);
        loadData<AdminProfile | null>('adminProfile', setAdminProfile, null);
        loadData<AuditLogEntry[]>('auditLog', setAuditLog, []);
        loadData<boolean>('resultsPublished', setResultsPublished, false);

    }, [activeWorkspace]);

    // Save data to local storage when it changes
    useEffect(() => {
        if (!activeWorkspace) return;
        const saveData = (key: string, data: any) => {
            localStorage.setItem(`ws_${activeWorkspace.id}_${key}`, JSON.stringify(data));
        };
        
        saveData('positions', positions);
        saveData('candidates', candidates);
        saveData('voters', voters);
        saveData('votes', votes);
        saveData('electionStatus', electionStatus);
        saveData('electionEndTime', electionEndTime);
        saveData('adminProfile', adminProfile);
        saveData('auditLog', auditLog);
        saveData('resultsPublished', resultsPublished);

    }, [positions, candidates, voters, votes, electionStatus, electionEndTime, adminProfile, auditLog, resultsPublished, activeWorkspace]);
    
    // Save super admin profile when it changes
    useEffect(() => {
         localStorage.setItem('election_superAdminProfile', JSON.stringify(superAdminProfile));
    }, [superAdminProfile]);
    
    // Save workspaces when they change
    useEffect(() => {
        localStorage.setItem('election_workspaces', JSON.stringify(workspaces));
    }, [workspaces]);

    // Theme persistence effect
    useEffect(() => {
        localStorage.setItem('election_theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);
    
    // --- HELPERS ---
    const addAuditLog = (action: AuditLogAction, details: string) => {
        let actor: AuditLogEntry['actor'] = { id: 'System', name: 'System', role: 'System' };
        if (loggedInSuperAdmin) {
            actor = { id: loggedInSuperAdmin.id, name: loggedInSuperAdmin.name, role: 'Super Admin' };
        } else if (loggedInAdmin) {
            actor = { id: loggedInAdmin.id, name: loggedInAdmin.name, role: 'Admin' };
        } else if (loggedInVoter) {
            actor = { id: loggedInVoter.id, name: loggedInVoter.name, role: 'Voter' };
        }

        const newLogEntry: AuditLogEntry = {
            id: `${Date.now()}-${Math.random()}`,
            timestamp: Date.now(),
            action,
            details,
            actor,
        };
        setAuditLog(prev => [newLogEntry, ...prev]);
    };

    const addAuditLogWithoutActor = (action: AuditLogAction, details: string, actor: AuditLogEntry['actor']) => {
        const newLogEntry: AuditLogEntry = {
            id: `${Date.now()}-${Math.random()}`,
            timestamp: Date.now(),
            action,
            details,
            actor,
        };
        setAuditLog(prev => [newLogEntry, ...prev]);
    };


    // --- HANDLERS ---

    const handleSetElectionStatus = (status: ElectionStatus) => {
        const actor = loggedInAdmin ? { id: loggedInAdmin.id, name: loggedInAdmin.name, role: 'Admin' as const } : { id: 'System', name: 'System', role: 'System' as const };
        
        if (status === 'IN_PROGRESS') {
            setElectionEndTime(Date.now() + 8 * 60 * 60 * 1000);
            addAuditLogWithoutActor('ELECTION_START', 'The election has been started.', actor);
        } else if (status === 'ENDED') {
            setElectionEndTime(null);
            addAuditLogWithoutActor('ELECTION_END', 'The election has been ended.', actor);
        }
        setElectionStatus(status);
    };

    const handleSetResultsPublished = (published: boolean) => {
        setResultsPublished(published);
        addAuditLog(published ? 'RESULTS_PUBLISHED' : 'RESULTS_HIDDEN', `Results were ${published ? 'publicly published' : 'hidden from public view'}.`);
    };
    
    const handleResetElection = () => {
        addAuditLog('ELECTION_RESET', 'The entire election data was reset.');
        setPositions([]);
        setCandidates([]);
        setVoters([]);
        setVotes([]);
        setAuditLog([]); // Also clear the audit log for the workspace
        setElectionStatus('NOT_STARTED');
        setElectionEndTime(null);
        setResultsPublished(false);
    };

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const handleLogin = (id: string, pass: string) => {
        setLoginError(null);
        const trimmedId = id.trim();
        
        // 1. Check for Super Admin (workspace-agnostic)
        if (trimmedId === superAdminProfile.id && pass === superAdminProfile.password) {
            setLoggedInSuperAdmin(superAdminProfile);
            setAppState('SUPER_ADMIN_VIEW');
            return;
        }

        // 2. From here, a workspace is required
        if (!activeWorkspace) {
            setLoginError("Please select a workspace before logging in.");
            return;
        }
        
        // 3. Check for Workspace Admin
        if (adminProfile && trimmedId === adminProfile.id && pass === adminProfile.password) {
            setLoggedInAdmin(adminProfile);
            addAuditLogWithoutActor('ADMIN_LOGIN', 'Admin logged in successfully.', {id: adminProfile.id, name: adminProfile.name, role: 'Admin'});
            setAppState('ADMIN_VIEW');
            return;
        }

        // 4. Check for Voter
        const voter = voters.find(v => v.id.toLowerCase() === trimmedId.toLowerCase());
        if (voter && pass === voter.password) {
            if (voter.isBlocked) {
                setLoginError('Your account is blocked. Please contact the administrator.');
                addAuditLogWithoutActor('VOTER_LOGIN_FAIL', `Login failed for voter '${voter.name}' (Account blocked).`, {id: voter.id, name: voter.name, role: 'Voter'});
                return;
            }
            if (electionStatus !== 'IN_PROGRESS') {
                setLoginError('The election is not currently in progress.');
                addAuditLogWithoutActor('VOTER_LOGIN_FAIL', `Login failed for voter '${voter.name}' (Election not in progress).`, {id: voter.id, name: voter.name, role: 'Voter'});
                return;
            }
            if (voter.hasVoted) {
                setLoginError('You have already cast your vote.');
                addAuditLogWithoutActor('VOTER_LOGIN_FAIL', `Login failed for voter '${voter.name}' (Already voted).`, {id: voter.id, name: voter.name, role: 'Voter'});
                return;
            }
            setLoggedInVoter(voter);
            addAuditLogWithoutActor('VOTER_LOGIN_SUCCESS', `Voter '${voter.name}' logged in successfully.`, {id: voter.id, name: voter.name, role: 'Voter'});
            setAppState('VOTER_VIEW');
            return;
        }

        // 5. If nothing matches
        setLoginError("Invalid credentials. Please check your ID and password.");
    };

    // FIX: Update function signature and implementation to handle multiple votes per position.
    const handleVote = (selections: { [key: number]: number[] }) => {
        if (!loggedInVoter) return;

        // FIX: Associate the vote with the voter by adding voterId.
        const newVotes: Vote[] = Object.entries(selections).flatMap(([posId, canIds]) =>
            canIds.map(canId => ({
                voterId: loggedInVoter.id,
                positionId: Number(posId),
                candidateId: canId,
                timestamp: Date.now()
            }))
        );

        setVotes(prev => [...prev, ...newVotes]);
        setVoters(prev => prev.map(v => v.id === loggedInVoter.id ? { ...v, hasVoted: true } : v));
        addAuditLog('VOTE_CAST', `Voter '${loggedInVoter.name}' cast their vote.`);
        setLoggedInVoter(null);
        setAppState('VOTED_SCREEN');
    };
    
    const handleWorkspaceLogout = () => {
        setLoggedInAdmin(null);
        setLoggedInVoter(null);
        setAppState('LOGIN');
    };
    
    const handleFullLogout = () => {
        setLoggedInAdmin(null);
        setLoggedInVoter(null);
        setLoggedInSuperAdmin(null);
        setActiveWorkspace(null); 
        localStorage.removeItem('election_last_workspace_id');
        setAppState('LOGIN');
    };
    
    const handleWorkspaceSelected = (workspace: Workspace) => {
        setActiveWorkspace(workspace);
        localStorage.setItem('election_last_workspace_id', workspace.id);
        setAppState('LOGIN');
    };
    
    const handleSwitchToWorkspaceSelect = () => {
        setLoggedInAdmin(null);
        setLoggedInVoter(null);
        setActiveWorkspace(null);
        localStorage.removeItem('election_last_workspace_id');
        setAppState('WORKSPACE_SELECT');
    };
    
    // --- Super Admin Handlers ---
    const getAdminProfileForWorkspace = (wsId: string): AdminProfile | null => {
        const savedProfile = localStorage.getItem(`ws_${wsId}_adminProfile`);
        return savedProfile ? JSON.parse(savedProfile) : null;
    };

    const setAdminProfileForWorkspace = (wsId: string, profile: AdminProfile) => {
        localStorage.setItem(`ws_${wsId}_adminProfile`, JSON.stringify(profile));
    };

    const handleDeleteWorkspace = (wsId: string) => {
        const wsName = workspaces.find(ws => ws.id === wsId)?.name || 'Unknown';
        addAuditLog('WORKSPACE_DELETED', `Workspace '${wsName}' (ID: ${wsId}) was deleted.`);
        setWorkspaces(prev => prev.filter(ws => ws.id !== wsId));
        // This is a bit of a nuclear option. It finds all keys in local storage for that workspace and deletes them.
        Object.keys(localStorage)
            .filter(key => key.startsWith(`ws_${wsId}_`))
            .forEach(key => localStorage.removeItem(key));
    };
    
    const getWorkspaceStatus = (wsId: string): ElectionStatus => {
        try {
            const savedStatus = localStorage.getItem(`ws_${wsId}_electionStatus`);
            return savedStatus ? JSON.parse(savedStatus) : 'NOT_STARTED';
        } catch (e) {
            return 'NOT_STARTED';
        }
    };
    
    const handleResetWorkspaceForNewElection = (wsId: string) => {
        // Reset votes, status, and voters' `hasVoted` flag for the given workspace
        localStorage.removeItem(`ws_${wsId}_votes`);
        localStorage.setItem(`ws_${wsId}_electionStatus`, JSON.stringify('NOT_STARTED'));
        localStorage.removeItem(`ws_${wsId}_electionEndTime`);
        localStorage.removeItem(`ws_${wsId}_resultsPublished`);
        
        const votersKey = `ws_${wsId}_voters`;
        const savedVoters = localStorage.getItem(votersKey);
        if (savedVoters) {
            try {
                const votersList: Voter[] = JSON.parse(savedVoters);
                const resetVoters = votersList.map(v => ({ ...v, hasVoted: false }));
                localStorage.setItem(votersKey, JSON.stringify(resetVoters));
            } catch (e) { console.error("Could not reset voters for workspace:", wsId, e); }
        }

        // Add an audit log entry to the target workspace
        const auditLogKey = `ws_${wsId}_auditLog`;
        const savedLogs = localStorage.getItem(auditLogKey);
        const logs: AuditLogEntry[] = savedLogs ? JSON.parse(savedLogs) : [];
        const actorProfile = loggedInSuperAdmin || superAdminProfile;
        const newLog: AuditLogEntry = {
            id: `${Date.now()}-sa-reset`,
            timestamp: Date.now(),
            actor: { id: actorProfile.id, name: actorProfile.name, role: 'Super Admin' },
            action: 'ELECTION_RESET',
            details: `Super Admin enabled a new election for this workspace.`
        };
        logs.unshift(newLog);
        localStorage.setItem(auditLogKey, JSON.stringify(logs));
    };


    const renderContent = () => {
        switch (appState) {
            case 'WORKSPACE_SELECT':
                return <WorkspaceManager 
                    workspaces={workspaces}
                    onWorkspaceSelected={handleWorkspaceSelected}
                    theme={theme}
                    toggleTheme={toggleTheme}
                    onGoBack={() => setAppState('LOGIN')}
                />;
            case 'LOGIN':
                return (
                    <>
                        <UnifiedLoginScreen
                            onLogin={handleLogin}
                            loginError={loginError}
                            theme={theme}
                            toggleTheme={toggleTheme}
                            electionStatus={electionStatus}
                            resultsPublished={resultsPublished}
                            onViewResults={() => setAppState('PUBLIC_RESULTS')}
                            workspace={activeWorkspace}
                            onSwitchWorkspace={handleSwitchToWorkspaceSelect}
                            setShowVoterVerification={setShowVoterVerification}
                        />
                        <VoterVerificationModal 
                            isOpen={showVoterVerification}
                            onClose={() => setShowVoterVerification(false)}
                            voters={voters}
                            theme={theme}
                        />
                    </>
                );
            case 'ADMIN_VIEW':
                if (!loggedInAdmin || !activeWorkspace || !adminProfile) return null;
                return <AdminPanel
                    positions={positions}
                    candidates={candidates}
                    voters={voters}
                    votes={votes}
                    adminProfile={adminProfile}
                    auditLog={auditLog}
                    addAuditLog={addAuditLog}
                    setPositions={setPositions}
                    setCandidates={setCandidates}
                    setVoters={setVoters}
                    setVotes={setVotes}
                    setAdminProfile={setAdminProfile}
                    onLogout={handleWorkspaceLogout}
                    theme={theme}
                    toggleTheme={toggleTheme}
                    electionStatus={electionStatus}
                    setElectionStatus={handleSetElectionStatus}
                    electionEndTime={electionEndTime}
                    handleResetElection={handleResetElection}
                    workspaceName={activeWorkspace.name}
                    resultsPublished={resultsPublished}
                    setResultsPublished={handleSetResultsPublished}
                />;
             case 'SUPER_ADMIN_VIEW':
                if (!loggedInSuperAdmin) return null;
                return <SuperAdminPanel 
                    workspaces={workspaces}
                    setWorkspaces={setWorkspaces}
                    superAdminProfile={superAdminProfile}
                    setSuperAdminProfile={setSuperAdminProfile}
                    onEnterWorkspace={(ws) => {
                        setActiveWorkspace(ws);
                        setLoggedInAdmin(getAdminProfileForWorkspace(ws.id)); // Pretend to be this admin
                        setAppState('ADMIN_VIEW');
                    }}
                    onDeleteWorkspace={handleDeleteWorkspace}
                    getAdminProfile={getAdminProfileForWorkspace}
                    setAdminProfile={setAdminProfileForWorkspace}
                    onLogout={handleFullLogout}
                    theme={theme}
                    toggleTheme={toggleTheme}
                    addAuditLog={addAuditLog}
                    getWorkspaceStatus={getWorkspaceStatus}
                    onEnableNewElection={handleResetWorkspaceForNewElection}
                />;
            case 'VOTER_VIEW':
                if (!loggedInVoter || !activeWorkspace) return null;
                return <VotingBooth
                    voter={loggedInVoter}
                    positions={positions}
                    candidates={candidates}
                    onVote={handleVote}
                    onLogout={handleWorkspaceLogout}
                    theme={theme}
                    toggleTheme={toggleTheme}
                    workspaceName={activeWorkspace.name}
                />;
            case 'VOTED_SCREEN':
                return <VotedScreen onLogout={handleWorkspaceLogout} theme={theme} toggleTheme={toggleTheme} />;
            case 'PUBLIC_RESULTS':
                 if (!activeWorkspace) {
                    handleSwitchToWorkspaceSelect();
                    return null;
                 };
                return <PublicResults
                    positions={positions}
                    candidates={candidates}
                    votes={votes}
                    onBack={() => setAppState('LOGIN')}
                    theme={theme}
                    toggleTheme={toggleTheme}
                    workspaceName={activeWorkspace.name}
                    electionStatus={electionStatus}
                    resultsPublished={resultsPublished}
                />;
            default:
                return <div>Invalid State</div>;
        }
    };

    return (
        <div className={theme}>
            {renderContent()}
        </div>
    );
};

export default App;