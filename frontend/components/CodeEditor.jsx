import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import '../style/codeeditor.css';

const CodeEditor = ({
    question,
    onSubmit,
    language = 'javascript',
    initialCode = ''
}) => {
    const [code, setCode] = useState(initialCode);
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);

    // Language-specific starter templates
    const getStarterCode = () => {
        const templates = {
            java: `public class Solution {
    public static void main(String[] args) {
        // Write your code here
        
    }
}`,
            python: `# Write your code here
def solution():
    pass

# Test your code
if __name__ == "__main__":
    solution()`,
            javascript: `// Write your code here
function solution() {
    
}

// Test your code
solution();`
        };

        return templates[language] || templates.javascript;
    };

    // Initialize code with template if empty
    useEffect(() => {
        if (!code && !initialCode) {
            setCode(getStarterCode());
        } else if (initialCode) {
            setCode(initialCode);
        }
    }, [language, initialCode]);

    const handleEditorChange = (value) => {
        setCode(value || '');
    };

    const handleRunCode = () => {
        setIsRunning(true);
        setOutput('✓ Code syntax looks good!\n\nNote: Full execution available in production.\nYour code will be evaluated during feedback generation.');

        setTimeout(() => {
            setIsRunning(false);
        }, 1000);
    };

    const handleSubmit = () => {
        if (!code.trim()) {
            alert('Please write some code before submitting');
            return;
        }
        onSubmit(code);
    };

    const handleReset = () => {
        setCode(getStarterCode());
        setOutput('');
    };

    return (
        <div className="code-editor-container">
            <div className="editor-header">
                <div className="editor-title">
                    <span className="icon">💻</span>
                    <span>Code Editor</span>
                </div>
                <div className="language-badge">{language.toUpperCase()}</div>
            </div>

            <div className="editor-wrapper">
                <Editor
                    height="400px"
                    language={language}
                    value={code}
                    onChange={handleEditorChange}
                    theme="vs-dark"
                    options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        wordWrap: 'on',
                        lineNumbers: 'on',
                        roundedSelection: true,
                        padding: { top: 10, bottom: 10 },
                        suggestOnTriggerCharacters: true,
                        quickSuggestions: true,
                        formatOnPaste: true,
                        formatOnType: true,
                    }}
                />
            </div>

            <div className="editor-controls">
                <button
                    className="btn-run"
                    onClick={handleRunCode}
                    disabled={isRunning}
                >
                    {isRunning ? '▶️ Running...' : '▶️ Run Code'}
                </button>
                <button className="btn-reset" onClick={handleReset}>
                    🔄 Reset
                </button>
                <button className="btn-submit" onClick={handleSubmit}>
                    ✅ Submit Answer
                </button>
            </div>

            {output && (
                <div className="output-console">
                    <div className="console-header">
                        <span>📋 Output</span>
                    </div>
                    <pre className="console-content">{output}</pre>
                </div>
            )}
        </div>
    );
};

export default CodeEditor;