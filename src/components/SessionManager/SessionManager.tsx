import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { setFileInfo, setParsedData } from "../../store/dataSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

const SessionManager: React.FC = () => {
  const dispatch = useDispatch();
  const { fileInfo, parsedData } = useSelector(
    (state: RootState) => state.data
  );
  const [sessionName, setSessionName] = useState("");
  const [savedSessions, setSavedSessions] = useState<string[]>([]);

  useEffect(() => {
    updateSavedSessions();
  }, []);

  const updateSavedSessions = () => {
    const sessions = Object.keys(localStorage).filter((key) =>
      key.startsWith("csvAnalysisSession_")
    );
    setSavedSessions(
      sessions.map((key) => key.replace("csvAnalysisSession_", ""))
    );
  };

  const saveSession = () => {
    if (!sessionName || !fileInfo || !parsedData) return;
    const sessionData = {
      fileInfo,
      parsedData,
    };
    localStorage.setItem(
      `csvAnalysisSession_${sessionName}`,
      JSON.stringify(sessionData)
    );
    updateSavedSessions();
    toast({
      title: "Session Saved",
      description: `Session "${sessionName}" has been saved successfully.`,
    });
    setSessionName("");
  };

  const loadSession = (name: string) => {
    const sessionData = localStorage.getItem(`csvAnalysisSession_${name}`);
    if (sessionData) {
      const { fileInfo, parsedData } = JSON.parse(sessionData);
      dispatch(setFileInfo(fileInfo));
      dispatch(setParsedData(parsedData));
      toast({
        title: "Session Loaded",
        description: `Session "${name}" has been loaded successfully.`,
      });
    }
  };

  const deleteSession = (name: string) => {
    localStorage.removeItem(`csvAnalysisSession_${name}`);
    updateSavedSessions();
    toast({
      title: "Session Deleted",
      description: `Session "${name}" has been deleted successfully.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Manager</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Enter session name"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
            />
            <Button
              onClick={saveSession}
              disabled={!sessionName || !fileInfo || !parsedData}
            >
              Save Session
            </Button>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Saved Sessions:</h3>
            {savedSessions.length === 0 ? (
              <p>No saved sessions.</p>
            ) : (
              <div className="space-y-2">
                {savedSessions.map((session) => (
                  <div key={session} className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      className="flex-grow"
                      onClick={() => loadSession(session)}
                    >
                      {session}
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteSession(session)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionManager;
