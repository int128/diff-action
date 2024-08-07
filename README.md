# diff-action [![ts](https://github.com/int128/diff-action/actions/workflows/ts.yaml/badge.svg)](https://github.com/int128/diff-action/actions/workflows/ts.yaml)

This is an action to compute a diff between head and base, and post it to a comment.

## Getting Started

To post a comment of the diff between `old-directory` and `new-directory`,

```yaml
- uses: int128/diff-action@v1
  with:
    base: old-directory
    head: new-directory
```

If no difference, it post a comment of "No diff".

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
      - uses: int128/diff-action@v1
        with:
          base: ${{ steps.kustomize-base.outputs.directory }}
          head: ${{ steps.kustomize-head.outputs.directory }}
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

### Comment strategy

This action supports the following strategies:

- `create`: Create a new comment.
- `replace`: Replace the body of existing comment if exists. (default)
- `append`: Append the diff to the existing comment if exists.
- `recreate`: Delete the existing comment and create a new one.

You can change the strategy by `update-if-exists`.

This action identifies the existing comment by both workflow name and job name.
You can set a custom key to `update-if-exists-key`.

## Specification

This action posts a comment on `pull_request` or `pull_request_target` event only.

### Inputs

| Name                   | Required                                   | Description                                                |
| ---------------------- | ------------------------------------------ | ---------------------------------------------------------- |
| `base`                 | (required)                                 | Path(s) of base (multiline)                                |
| `head`                 | (required)                                 | Path(s) of head (multiline)                                |
| `label`                | -                                          | Label(s) to add or remove to indicate the diff (multiline) |
| `comment-header`       | -                                          | Header of a comment to post                                |
| `comment-footer`       | -                                          | Footer of a comment to post                                |
| `update-if-exists`     | (optional)                                 | Either `create`, `replace`, `append` or `recreate`         |
| `update-if-exists-key` | `${{ github.workflow }}/${{ github.job }}` | Key for `update-if-exists`                                 |
| `skip-no-diff`         | -                                          | Do not add comments for empty diff                         |
| `token`                | `github.token`                             | GitHub token to post a comment                             |

### Outputs

| Name        | Description                                            |
| ----------- | ------------------------------------------------------ |
| `different` | If there is any difference, `true`. Otherwise, `false` |
