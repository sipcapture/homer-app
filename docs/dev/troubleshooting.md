# Troubleshooting

## General

1. The most useful thing to find why something doesn't work in scope is to check the scope object. Click mouse right button on a problematic UI element and select Inspect in the context menu. Find Console, type `$($0).scope()` and see the clicked element scope object. Navigate to `$parent` property for parent scopes.
2. Put `debugger` in the code to investigate run-time errors.
