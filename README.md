# diff-action [![ts](https://github.com/int128/diff-action/actions/workflows/ts.yaml/badge.svg)](https://github.com/int128/diff-action/actions/workflows/ts.yaml)

This is an action to run `diff` command and post it to a comment.


## Show diff of rendered manifests

If you use `kustomize build` in your CI/CD pipeline, it would be useful if you can see the rendered diff on a pull request.

To build manifests with [int128/kustomize-action](https://github.com/int128/kustomize-action) and show diff of it:

```yaml
jobs:
  diff:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/checkout@v2
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

Here is an example,

![image](https://user-images.githubusercontent.com/321266/130011226-7487cbd9-4a1f-4a04-ae6c-7cb9456324ab.png)


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

This action posts a comment on pull request event only.

### Inputs

| Name | Required | Description
|------|----------|-------------
| `base` | (required) | base path (multiline)
| `head` | (required) | head path (multiline)
| `label` | - | label(s) to add/remove to indicate diff (multiline)
| `comment-header` | - | header of a comment to post
| `comment-footer` | - | footer of a comment to post
| `token` | `github.token` | GitHub token to post a comment


### Outputs

| Name | Description
|------|------------
| `different` | `true` if there is any difference, or `false`
