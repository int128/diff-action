# diff-action [![ts](https://github.com/int128/diff-action/actions/workflows/ts.yaml/badge.svg)](https://github.com/int128/diff-action/actions/workflows/ts.yaml)

This is an action to format the diff between head and base.

## Migration to V2

This action no longer posts a comment by itself.
You can post a comment using [int128/comment-action](https://github.com/int128/comment-action).

```yaml
steps:
  - uses: int128/diff-action@v2
    with:
      base: old-directory
      head: new-directory
  - uses: int128/comment-action@v1
    with:
      post: |
        ## Diff
        ${{ steps.diff.outputs.comment-body }}
```

## Getting Started

To get the diff between `old-directory` and `new-directory`,

```yaml
- uses: int128/diff-action@v1
  with:
    base: old-directory
    head: new-directory
```

If no difference, it returns an empty string.

### Show diff of generated manifests

If you use `kustomize build` in your CI/CD pipeline, it would be useful if you can see the diff on a pull request.

To build manifests with [int128/kustomize-action](https://github.com/int128/kustomize-action) and show diff of it:

```yaml
jobs:
  diff:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write # required to post a comment to a pull request
    steps:
      - uses: actions/checkout@v4
      - uses: actions/checkout@v4
        with:
          ref: main
          path: main
      - uses: int128/kustomize-action@v1
        id: kustomize-head
        with:
          kustomization: config/default/kustomization.yaml
          write-individual-files: true
      - uses: int128/kustomize-action@v1
        id: kustomize-base
        with:
          base-directory: main
          kustomization: config/default/kustomization.yaml
          write-individual-files: true
      - uses: int128/diff-action@v2
        with:
          base: ${{ steps.kustomize-base.outputs.directory }}
          head: ${{ steps.kustomize-head.outputs.directory }}
      - uses: int128/comment-action@v1
        with:
          update-if-exists: replace
          post: |
            ## kustomize diff
            ${{ steps.diff.outputs.comment-body }}
```

Here is an example.

<img width="920" alt="image" src="https://user-images.githubusercontent.com/321266/169690472-a74d764d-3567-4d5b-adc4-e8efc9dd4d6c.png">

### Label to indicate the change

To add label(s) if there is difference or remove it if not:

```yaml
- uses: int128/diff-action@v1
  with:
    base: ${{ steps.kustomize-base.outputs.directory }}
    head: ${{ steps.kustomize-head.outputs.directory }}
    label: manifest-changed
```

## Specification

This action posts a comment on `pull_request` or `pull_request_target` event only.

### Inputs

| Name    | Default        | Description                                                |
| ------- | -------------- | ---------------------------------------------------------- |
| `base`  | (required)     | Path(s) of base (multiline)                                |
| `head`  | (required)     | Path(s) of head (multiline)                                |
| `label` | -              | Label(s) to add or remove to indicate the diff (multiline) |
| `token` | `github.token` | GitHub token to post a comment                             |

### Outputs

| Name           | Description                                            |
| -------------- | ------------------------------------------------------ |
| `different`    | If there is any difference, `true`. Otherwise, `false` |
| `comment-body` | Comment body                                           |
