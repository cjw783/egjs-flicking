# Flicking 시스템 통합 StateChart

## 컴포넌트 개요

Flicking은 다음과 같은 핵심 컴포넌트로 구성됩니다:

1. **Viewport**: 패널이 보여지는 컨테이너 역할을 하며 크기를 관리
2. **Camera**: 패널 위치와 가시성을 제어하고 시각적인 부분을 담당
3. **Control**: 사용자 입력과 애니메이션을 관리하고 패널 이동을 제어
4. **Renderer**: 패널 객체를 생성하고 렌더링을 담당
5. **Panel**: 개별 슬라이드를 나타내며 위치 및 크기 정보를 관리

## 컴포넌트 간 관계도

```mermaid
graph TD
    F[Flicking] --> V[Viewport]
    F --> CM[Camera]
    F --> C[Control]
    F --> R[Renderer]
    
    R -->|생성/관리| P[Panel]
    CM -->|시각화/위치 제어| P
    C -->|입력 처리/이동| CM
    V -->|크기 제공| CM
    V -->|크기 제공| R
    
    subgraph "패널 관리"
        R
        P
    end
    
    subgraph "위치/이동 관리"
        CM
        C
    end
    
    subgraph "크기 관리"
        V
    end
```

## 상태 종합 다이어그램

```mermaid
stateDiagram-v2
    [*] --> Uninitialized: 생성

    state Uninitialized {
        ViewportInit: Viewport 초기화
        CameraInit: Camera 초기화
        ControlInit: Control 초기화
        RendererInit: Renderer 초기화
    }

    Uninitialized --> Initialized: init()
    
    state Initialized {
        Idle: 입력 대기 상태
        Interacting: 사용자 상호작용 중
        Animating: 애니메이션 중
        
        Idle --> Interacting: 사용자 입력
        Interacting --> Animating: 드래그 종료
        Animating --> Idle: 애니메이션 완료
        Idle --> Animating: API 호출
        
        state Interacting {
            Holding
            Dragging
            
            Holding --> Dragging: 드래그 시작
        }
        
        state "Panel 상태" as PanelStates {
            PanelCreated --> PanelRendered: 보이는 범위
            PanelRendered --> PanelHidden: 범위 밖
            PanelRendered --> PanelToggled: 순환 모드
            PanelToggled --> PanelRendered: 위치 복원
        }
    }
    
    Initialized --> Resizing: resize() 호출
    Resizing --> Initialized: 크기 조정 완료
    
    Initialized --> PanelsChanging: 패널 추가/제거
    PanelsChanging --> Initialized: 패널 변경 완료
    
    Initialized --> Destroyed: destroy()
```

## 이벤트 흐름도

```mermaid
sequenceDiagram
    participant User
    participant F as Flicking
    participant C as Control
    participant CM as Camera
    participant R as Renderer
    participant P as Panel
    participant V as Viewport
    
    Note over F,V: 초기화 단계
    F->>V: 생성 및 초기화
    F->>CM: 생성 및 초기화
    F->>C: 생성 및 초기화
    F->>R: 생성 및 초기화
    R->>+P: 패널 생성
    P-->>-R: 패널 생성 완료
    F->>F: 이벤트 트리거 (READY)
    
    Note over F,V: 사용자 입력 단계
    User->>C: 터치/마우스 입력
    C->>C: 상태 변경 (Idle -> Holding)
    C->>F: 이벤트 트리거 (HOLD_START)
    User->>C: 드래그
    C->>C: 상태 변경 (Holding -> Dragging)
    C->>CM: 위치 업데이트
    CM->>P: 가시성 업데이트
    F->>F: 이벤트 트리거 (MOVE)
    
    Note over F,V: 애니메이션 단계
    User->>C: 입력 해제
    C->>C: 상태 변경 (Dragging -> Animating)
    C->>CM: 목표 위치 계산
    C->>F: 이벤트 트리거 (WILL_CHANGE/WILL_RESTORE)
    C->>CM: 애니메이션 시작
    CM->>P: 위치 업데이트
    P->>P: 순환 모드 처리(필요시)
    CM->>R: 렌더링 요청
    R->>P: 패널 렌더링
    C->>F: 이벤트 트리거 (CHANGED/RESTORED)
    C->>C: 상태 변경 (Animating -> Idle)
    
    Note over F,V: 크기 변경 단계
    User->>F: 크기 변경 이벤트
    F->>V: 크기 업데이트
    F->>F: 이벤트 트리거 (BEFORE_RESIZE)
    V->>R: 패널 크기 업데이트 요청
    R->>P: 크기 재계산
    CM->>CM: 범위/위치 업데이트
    C->>C: 입력 상태 업데이트
    F->>F: 이벤트 트리거 (AFTER_RESIZE)
```

## 핵심 동작 시나리오

### 1. 초기화 프로세스

```mermaid
graph TD
    A[Flicking 생성] --> B[Viewport 초기화]
    B --> C[Renderer 초기화]
    C --> D[패널 수집]
    D --> E[Camera 초기화]
    E --> F[Camera 모드 결정]
    F --> G[Control 초기화]
    G --> H[초기 패널로 이동]
    H --> I[READY 이벤트 발생]
```

### 2. 패널 이동 프로세스

```mermaid
graph TD
    A[사용자 입력 또는 API 호출] --> B{입력 유형?}
    B -->|사용자 입력| C[Control: Idle -> Holding]
    B -->|API 호출| D[Control: moveToPanel/moveToPosition]
    
    C --> E[Control: Holding -> Dragging]
    E --> F[Camera 위치 업데이트]
    F --> G[Panel 가시성 업데이트]
    G --> H[Control: 입력 종료]
    
    H --> I{이동 조건?}
    I -->|충분한 이동| J[다음/이전 패널로 애니메이션]
    I -->|불충분한 이동| K[원래 패널로 복원]
    
    D --> L[Camera 목표 위치 계산]
    L --> M[애니메이션 시작]
    
    J --> N[Control: activePanel 업데이트]
    K --> O[Control: 원래 상태 유지]
    M --> P[Camera 위치 변경 완료]
    
    N --> Q[CHANGED 이벤트 발생]
    O --> R[RESTORED 이벤트 발생]
    P --> S["이벤트 발생(CHANGED/RESTORED)"]
    
    Q --> T[Control: Animating -> Idle]
    R --> T
    S --> T
```

### 3. 순환 모드 처리

```mermaid
graph TD
    A[Camera가 범위 끝에 도달] --> B{circular 활성화?}
    B -->|Yes| C[패널 순서 재배치]
    B -->|No| D{bound 활성화?}
    
    C --> E["Panel toggle() 호출"]
    E --> F[Panel offset 업데이트]
    F --> G[Camera 위치 조정]
    
    D -->|Yes| H[범위 내로 제한]
    D -->|No| I[바운스 효과 적용]
    
    G --> J[패널 렌더링 업데이트]
    H --> J
    I --> J
```

## 컴포넌트 간 의존성 및 책임

1. **Flicking**: 모든 컴포넌트 생성 및 조율, 이벤트 발행
   - 의존: Viewport, Camera, Control, Renderer
   - 책임: 컴포넌트 생명주기 관리, 설정 전파, 이벤트 관리

2. **Viewport**: 뷰포트 크기 및 레이아웃 관리
   - 의존: (없음)
   - 책임: 크기 계산, 패딩 처리, 크기 변경 이벤트 감지

3. **Camera**: 패널 위치 및 가시성 제어
   - 의존: Viewport(크기), Renderer(패널)
   - 책임: 위치 계산, 앵커 포인트 관리, 순환 모드 처리, 패널 가시성 결정

4. **Control**: 사용자 입력 및 애니메이션 처리
   - 의존: Camera(위치 제어)
   - 책임: 입력 처리, 상태 관리, 애니메이션 실행, 활성 패널 관리

5. **Renderer**: 패널 생성 및 렌더링
   - 의존: Viewport(크기), Camera(위치 정보)
   - 책임: 패널 생성, DOM 관리, 패널 크기 계산, 렌더링 전략 실행

6. **Panel**: 개별 슬라이드 정보 관리
   - 의존: (없음)
   - 책임: 크기/위치 정보 유지, 순환 모드 토글 상태 관리, 콘텐츠 로딩 처리

## 이벤트 종합 표

| 이벤트 | 발생 시점 | 관련 컴포넌트 | 주요 데이터 |
|--------|----------|--------------|-----------|
| READY | 초기화 완료 후 | Flicking, 모든 컴포넌트 | - |
| BEFORE_RESIZE | 크기 조정 전 | Viewport | 기존 크기 |
| AFTER_RESIZE | 크기 조정 후 | Viewport, Camera, Renderer | 새 크기 |
| HOLD_START | 사용자 입력 시작 | Control | 입력 좌표 |
| HOLD_END | 사용자 입력 종료 | Control | 입력 좌표, 속도 |
| MOVE_START | 이동 시작 | Control, Camera | 시작 위치 |
| MOVE | 이동 중 | Control, Camera | 현재 위치 |
| MOVE_END | 이동 종료 | Control, Camera | 종료 위치 |
| WILL_CHANGE | 패널 변경 예정 | Control | 목표 패널 |
| CHANGED | 패널 변경 완료 | Control | 변경된 패널 |
| WILL_RESTORE | 패널 복원 예정 | Control | 현재 패널 |
| RESTORED | 패널 복원 완료 | Control | 현재 패널 |
| NEED_PANEL | 패널 추가 필요 | Camera | 필요 방향 |
| VISIBLE_CHANGE | 보이는 패널 변경 | Camera | 보이는 패널 배열 |
| REACH_EDGE | 가장자리 도달 | Camera | 도달한 방향 |
| PANEL_CHANGE | 패널 추가/제거 | Renderer | 변경된 패널 |

## 시스템 통합 결론

Flicking 시스템은 상호 연결된 컴포넌트들의 복합체로, 각 컴포넌트는 명확한 책임을 가지고 협력합니다:

1. **분리된 관심사**: 각 컴포넌트는 고유한 책임 영역을 가지고 있으며, 이는 코드 유지보수성과 확장성을 높입니다.

2. **상태 기반 설계**: 각 컴포넌트는, 특히 Control의, 명확한 상태 머신으로 설계되어 복잡한 사용자 상호작용을 예측 가능하게 처리합니다.

3. **확장 가능한 전략 패턴**: Camera 모드, Control 전략, Renderer 전략 등 다양한 전략 패턴을 적용하여 유연한 동작을 지원합니다.

4. **이벤트 중심 통신**: 컴포넌트 간 직접적인 의존성을 최소화하고 이벤트를 통한 통신으로 느슨한 결합을 유지합니다.

5. **최적화 중심 설계**: 렌더링 최적화, 가상화, 계산 캐싱 등 성능을 고려한 다양한 기법이 적용되어 있습니다. 