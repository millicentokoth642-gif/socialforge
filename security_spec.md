# SocialSim Security Specification

## Data Invariants
1. A **Post** must have a valid `authorId` matching the creator's UID.
2. A **Comment** must belong to a valid `postId` and its `authorId` must match the creator.
3. A **Reaction** is unique per user per post.
4. **Profiles** can only be edited by the owner.
5. **Messages** can only be read/written by participants of the parent **Chat**.

## The "Dirty Dozen" Payloads (Denial Expected)
1. Creating a Post with someone else's `authorId`.
2. Updating a Post's `authorId` (Immutability check).
3. Injecting `isVerified: true` as a normal user.
4. Posting a Comment to a non-existent `postId`.
5. Deleting someone else's comment.
6. Reading a Chat you aren't a participant of.
7. Sending a Message to a Chat you aren't in.
8. Modifying the `createdAt` timestamp of a post.
9. Upvoting your own post 1000 times (Reaction logic).
10. Setting `followersCount` to 1,000,000 on your profile without admin rights.
11. Injecting 1MB of junk data into a message `content` field.
12. Attempting to list all profiles without being authenticated.

## Rules Draft Strategy
- Use `isValidId()` for all document IDs.
- Use `isValid[Entity]()` for all writes.
- Enforce `request.time` for all timestamps.
- Immutability for ownership fields.
