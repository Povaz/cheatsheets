# CheatSheet Specifications

## Goals
- Learning Consolidation: provide a comprehensive overview of topics, allowing users to quickly grasp the key concepts and information they have already studied through the users' photographic memory.
- Learning Retention: serve as a reference for users to look up specific information about a topic without having to go through extensive documentation or resources.

### What is not the Goal
- Completeness of Information: information shown is comprehensive of what the user has already studied, not necessarily comprehensive of all information regarding the topic.


## Project Definitions & Terminology

Overview of the project's terminology and definitions:
- Goals are implemented via CheatSheets generation.
- Each Topic is related to one CheatSheet.
- A Topic might have related SubTopics.
- A CheatSheet is a collection of Sheets.
- Each SubTopic is related to a specific Sheet of a CheatSheet.

### Content - Topic & Subtopics
- A Topic is a broad subject area that encompasses various concepts, principles, and information related to a specific field of study or interest.
- SubTopics are specific areas or aspects within a Topic that provide more detailed information and focus on particular concepts or principles related to the broader Topic.

Their relationship definition is kept simple and general to allow flexibility in defining how Topics are split into SubTopics. In extreme cases, SubTopics are completely arbitrary and can be defined as needed.

Example 1:
- Topic: Python
- SubTopics: Python 3.13, Python 3.14, Python 3.15

Example 2:
- Topic: Claude Code
- SubTopics: Commands, Agents, Skills, Context Management. 

### View - CheatSheet & Sheets
- A CheatSheet represents the view of a Topic.
- A CheatSheet is a collection of Sheets, one for each SubTopic of the Topic.
- A Sheet is a specific view of a SubTopic of a CheatSheet.

The fundamental property of Sheets is that they offer an organized, comprehensive view of SubTopic information in one single interactive interface. Leveraging photograpic memory is at the center of the User's needs.

CheatSheets offer a unified style for all Sheets it contains.

## Processes

The project contains four processes:
1. CheatSheet Creation: a new CheatSheet is generated and added to the list of available CheatSheets.
2. CheatSheet Update: an existing CheatSheet is updated with new information or changes.
3. CheatSheet View: the User navigate the CheatSheet of a Topic and its Sheets.
4. CheatSheet Removal: a CheatSheet is removed from the list of available CheatSheets.

### CheatSheets/Sheets Generation

1. The User selects a new Topic for which they want to generate a CheatSheet.
2. The User selects the first SubTopic of the Topic.
3. A list of Sources is generated based on the Topic → SubTopic provided.
   - A Source is a specific resource or reference that contains information related to the Topic.
   - It can be a book (PDF file), article (URL), video, or any other type of document that provides relevant information about the Topic.
4. All Sources are processed, and their information organized in a single comprehensive Markdown file, which represents the content of the SubTopic.
5. CheatSheets and the first Sheet of the CheatSheet are generated and added to the list of available CheatSheets.

### CheatSheets/Sheets Update

A CheatSheet is updated in two ways:
1. Source List is changed.
2. A new SubTopic is added to the Topic.

If a Source List is changed, each SubTopic impacted by the change is impacted:
1. The new list of Sources is processed, and their related Markdown files are updated.
2. CheatSheet and impacted Sheets are updated.

If a new Subtopic is added:
1. A new List of Sources is generated.
2. The new List of Sources is processed into a its new Content Markdown file.
3. A new Sheet is generated and added to the CheatSheet.

### CheatSheets View

1. The User selects a CheatSheet to view its Sheets.
2. The User navigates through the Sheets of the selected CheatSheet, accessing the information related to each SubTopic.
3. The User can interact with the Sheets, such as expanding sections, clicking on links, or accessing additional resources related to the SubTopic information.

### CheatSheets Removal

Either the entire CheatSheet is removed along with all its Sheets or only the selected Sheet is removed.