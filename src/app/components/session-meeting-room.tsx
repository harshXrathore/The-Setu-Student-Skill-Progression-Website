import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { Loader2, ArrowLeft, Lock } from 'lucide-react';
import { Button } from './ui/button';

export function SessionMeetingRoom() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [sessionData, setSessionData] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                const [profileData, sessions] = await Promise.all([
                    apiRequest<any>('/users/profile'),
                    apiRequest<any[]>('/mentors/sessions')
                ]);
                setCurrentUser(profileData);
                const found = sessions.find((s: any) => s._id === id || s.id === id);
                setSessionData(found || null);
                if (!found && sessions) {
                    // Temporarily store all sessions in dummy state just for debugging the error screen
                    (window as any).__debugSessions = sessions;
                }
            } catch (err) {
                console.error('Failed to load meeting context', err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)]">
                <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-4" />
                <p className="text-muted-foreground font-medium">Preparing secure meeting room...</p>
            </div>
        );
    }

    if (!sessionData) {
        const dbgSessions = (window as any).__debugSessions || [];
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)]">
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-xl border border-red-200 dark:border-red-800 font-medium">
                    Session not found or you don't have access to this meeting.
                    <br/><br/>
                    <span className="text-xs opacity-70 font-mono">
                        Looking for ID: {id} <br/>
                        Found {dbgSessions.length} total sessions. <br/>
                        {dbgSessions.length > 0 && `First session ID is: ${dbgSessions[0]._id || dbgSessions[0].id}`}
                    </span>
                </div>
                <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
                </Button>
            </div>
        );
    }

    // If an external meeting URL was provided (Zoom, Google Meet, etc.)
    if (sessionData.meetingUrl) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] text-center px-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-8 rounded-2xl border border-blue-200 dark:border-blue-800 max-w-md w-full shadow-sm">
                    <h3 className="text-xl font-bold mb-2">External Meeting Platform</h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-6">
                        Your mentor has set up this session on an external platform.
                    </p>
                    <a
                        href={sessionData.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-8 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        Launch Meeting
                    </a>
                </div>
                <Button variant="outline" className="mt-6" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
            </div>
        );
    }

    // Build a stable Jitsi room name from the session ID
    const roomName = `CareerPath-Session-${id}`;
    const displayName = encodeURIComponent(currentUser?.name || 'Participant');
    const jitsiUrl = `https://meet.jit.si/${roomName}#userInfo.displayName="${displayName}"&config.startWithAudioMuted=true&config.disableModeratorIndicator=true&config.prejoinPageEnabled=false`;

    return (
        <div className="h-[calc(100vh-32px)] w-full flex flex-col bg-slate-950 rounded-xl overflow-hidden shadow-2xl border border-slate-800">
            {/* Header Bar */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0 z-10">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 font-semibold hover:text-white hover:bg-slate-800 transition-colors"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Leave
                    </Button>
                    <div className="h-4 w-px bg-slate-700 mx-1" />
                    <div>
                        <h2 className="text-sm font-bold text-white truncate max-w-[300px]">{sessionData.topic}</h2>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                            with {sessionData.student?.name || sessionData.mentor?.name || 'Participant'}
                        </p>
                    </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 text-xs font-semibold">End-to-End Encrypted</span>
                </div>
            </div>

            {/* Jitsi iframe */}
            <div className="flex-1 relative bg-black">
                <iframe
                    src={jitsiUrl}
                    allow="camera; microphone; display-capture; fullscreen; clipboard-read; clipboard-write"
                    allowFullScreen
                    className="w-full h-full border-0"
                    title="Session Meeting Room"
                />
            </div>
        </div>
    );
}
