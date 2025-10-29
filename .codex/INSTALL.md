# Installing Wrangler for Codex

Quick setup to enable wrangler skills in Codex.

## Installation

1. **Clone wrangler repository**:
   ```bash
   mkdir -p ~/.codex/wrangler
   cd ~/.codex/wrangler
   git clone [your-wrangler-repo-url] .
   ```

2. **Create personal skills directory**:
   ```bash
   mkdir -p ~/.codex/skills
   ```

3. **Update ~/.codex/AGENTS.md** to include this wrangler section:
   ```markdown
   ## Wrangler System

   <EXTREMELY_IMPORTANT>
   You have wrangler. Wrangler teaches you new skills and capabilities. RIGHT NOW run: `~/.codex/wrangler/.codex/wrangler-codex bootstrap` and follow the instructions it returns.
   </EXTREMELY_IMPORTANT>
   ```

## Verification

Test the installation:
```bash
~/.codex/wrangler/.codex/wrangler-codex bootstrap
```

You should see skill listings and bootstrap instructions. The system is now ready for use.