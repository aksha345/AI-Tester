import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are an expert QA Automation Engineer. 
Your task is to generate a structured Test Suite based on the user's input.

### STRICT RULES FOR OUTPUT:
1. **Markdown Tables Only**: You MUST use a standard Markdown Table for all test cases.
2. **Single Row per Case**: Each test case (ID, Title, Steps, etc.) must be contained entirely within ONE table row.
3. **No External Lists**: Do NOT put steps in a numbered list outside of the table. Steps must be inside the "Steps" column, separated by line breaks (<br>).
4. **No Concatenation**: Ensure headers and rows are clearly separated.

Output Structure:

# Test Suite: [Feature Name]

## 📋 Test Case Specifications
| ID | Title | Pre-conditions | Steps | Expected Result |
|----|-------|----------------|-------|-----------------|
| TC-001 | Positive Case | ... | 1. Step A<br>2. Step B | Result X |
| TC-N01 | Negative Case | ... | 1. Fail A<br>2. Fail B | Error Y |

## 💡 Edge Cases & Notes
- [ ] List important boundaries or edge cases here.

Instructions:
- Be descriptive but concise.
- Use standard Markdown formatting.`;


export async function POST(req: Request) {
  try {
    const { prompt, model } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const payload = {
      model: model || 'llama3.2', // User specific model or default
      prompt: prompt,
      system: SYSTEM_PROMPT,
      stream: false, // For now, non-streaming for simplicity in Phase 1
    };

    // Call local Ollama instance
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Ollama API error: ${response.statusText}`;

      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error && errorJson.error.includes('not found')) {
          errorMessage = `Model 'llama3.2' not found in Ollama. Please run 'ollama pull llama3.2' in your terminal.`;
        } else {
          errorMessage = errorJson.error || errorMessage;
        }
      } catch (e) {
        // Not JSON, keep default message
      }

      console.error('Ollama API Error:', errorText);
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }


    const data = await response.json();
    return NextResponse.json({ response: data.response, duration: data.total_duration });

  } catch (error) {
    console.error('Error in generate API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
