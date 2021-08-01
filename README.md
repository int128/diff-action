# diff-action [![ts](https://github.com/int128/diff-action/actions/workflows/ts.yaml/badge.svg)](https://github.com/int128/diff-action/actions/workflows/ts.yaml)

This is an action to run `diff` and post a comment.


## Getting Started

### Usecase: show diff of rendered manifests on pull request

When you use `kustomize build` in your CI/CD pipeline, it would be useful if you can see the rendered diff on a pull request.
For example,

![screenshot](https://user-images.githubusercontent.com/321266/127755329-5f9f81e3-af05-48e8-91dd-a99fefe557e4.png)

To run this action with [int128/kustomize-action](https://github.com/int128/kustomize-action):

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

Note that this action posts a comment only on a pull request event.


## Inputs

| Name | Required | Description
|------|----------|-------------
| `base` | yes | base path
| `head` | yes | head path
| `comment-header` | no | header in a comment to post
| `token` | no | GitHub token to post a comment


## Outputs

| Name | Description
|------|------------
