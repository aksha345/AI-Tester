# SOP: Automated Test Case Generation

**Goal**: Generate structured test cases (Positive, Negative, Edge Cases) from a user-provided description or code snippet using a local LLM (Ollama).

## 1. Inputs
- **User Prompt**: String (Description of feature or raw code).
- **Model**: String (Default: `llama3.2`).

## 2. Process / Logic
1.  **Validation**: Ensure Prompt is not empty.
2.  **Context Construction**:
    - Load System Prompt (defined below).
    - Append User Prompt.
3.  **Execution** (Tool Call):
    - Send payload to Ollama API (`POST /api/generate`).
    - *Param*: `stream: false` (for atomic reliability).
4.  **Formatting**:
    - Receive raw Markdown.
    - Validate it contains the required headers (e.g., "# Test Suite").
5.  **Output**: Return formatted Markdown to UI.

## 3. System Prompt Template
(Standardized Source of Truth)
```text
You are an expert QA Automation Engineer. 
Your task is to generate comprehensive test cases based on the user's input description.

Output Format:
Please strictly follow this Markdown structure for the test cases:

# Test Suite: [Feature Name]

## 1. Positive Test Cases
| ID | Title | Pre-conditions | Steps | Expected Result |
|----|-------|----------------|-------|-----------------|
| TC-001 | ... | ... | ... | ... |

## 2. Negative Test Cases
| ID | Title | Pre-conditions | Steps | Expected Result |
|----|-------|----------------|-------|-----------------|
| TC-N01 | ... | ... | ... | ... |

## 3. Edge Cases
- [ ] Description of edge case 1
- [ ] Description of edge case 2
```

## 4. Edge Cases Strategy
- **Ollama Down**: Return clear error message to UI ("Connection Failed").
- **Model Missing**: Return specific error "Model not found".
- **Garbage Output**: If output doesn't start with Markdown headers, wrap in a warning block.
