Was thinking more about the figma/figma make stuff more. I still feel like getting frontend design/UX stuff figured out is one of the areas where we’re least AI enabled currently. Gunna share some thoughts in case you end up coming back around to feeling like you really do need figma integration working.

first, I feel like it’s maybe not worth the effort to invest in using figma make given its shortcomings. If only we could get at the system prompt for figma make (I tried a few weeks ago to trick it into just giving it to me but they did a good job of tuning it to not do that). cuz really all we want is to get whatever prompts and skills make it good at UI design and turn those into claude skills. Seems like the things we want are:
Claude to be able to talk to the figma project directly so we can take our existing prototype and say “build out our design framework based on what we’re doing in the app now”
When we do a new spec that involves UI changes (e.g. adding the cloak/uncloak functionality), there should be another command/skill that’s like “generate-wireframes-for-spec” that takes you through an interactive Q&A flow with claude to have it ask you questions needed to clarify what you’re looking for and then have it generate wireframes in the figma project. you iterate on those til ur happy.
Once the wireframes are locked, the spec /plan/issues get updated with references to the mocks where applicable
the implement workflow guides the implementation agents to make it pixel perfect with the wireframes

But i think the key things in all of this are:
that the prompts/skills are able to actually get claude to perform like a competent designer
the setup is such that that iteration on wireframe step is quick.

If we want to try and go with a claude-centric approach, these are the things I think we could try:
the claude 1st part plugin/mcp for figma seems to be read only. So we probably need to roll our own forked version of an OS one I found (https://github.com/samjhecht/figma-mcp-write-server). That MCP was working more or less ok for allowing claude to make changes in figma, but we may still need to make additional improvements to my fork when it comes to controlling context flooding (figma responses are very very token heavy iirc)
We should see if we can extract and learn from any of the skills that are in the claude figma plugin and steal those. In parallel to that, we should do a research spike to see what other resources are out there for use in creating our own set of skills for guiding claude on how to work in figma.
we’ll need to resurrect the design skills in wrangler: design**design-system-setup/ (Full skill + 3 design templates -minimal, modern, vibrant), design**design-system-governance/, figma-design-workflow/
