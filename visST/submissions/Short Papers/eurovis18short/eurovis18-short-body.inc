\newcommand{\red}[1]{\textcolor{red}{#1}}
%\newcommand{\red}[1]{\textcolor{black}{#1}}
\newcommand{\note}[1]{\marginpar{\tiny\red{#1}}}


\title[Improving Provenance Data Interaction for Visual Storytelling
in Medical Imaging Data Exploration]%
{Improving Provenance Data Interaction for Visual Storytelling\\ in
Medical Imaging Data Exploration} % %

% for anonymous conference submission please enter your SUBMISSION ID
% instead of the author's name (and leave the affiliation blank) !!
\author[L. Amabili et al.]
{\parbox{\textwidth}{\centering L. Amabili$^1$, J. Kosinka$^1$, M.A.J. van Meersbergen$^3$, P.M.A. van Ooijen$^2$, J.B.T.M. Roerdink$^1$, P. Svetachov$^4$ and L. Yu$^1$}
\\
{\parbox{\textwidth}{\centering $^1$JBI, University of Groningen, \hspace{0.2 cm}
$^2$University Medical Center Groningen, \hspace{0.2 cm}
$^3$Netherlands eScience Center, \hspace{0.2 cm}
$^4$Center for Information Technology, RUG}
}}


% ------------------------------------------------------------------------

% if the Editors-in-Chief have given you the data, you may uncomment
% the following five lines and insert it here
%
% \volume{36}   % the volume in which the issue will be published;
% \issue{1}     % the issue number of the publication
% \pStartPage{1}      % set starting page


%-------------------------------------------------------------------------


% uncomment for using teaser
% \teaser{
%  \includegraphics[width=\linewidth]{eg_new}
%  \centering
%   \caption{New EG Logo}
% \label{fig:teaser}
%}

\maketitle
%-------------------------------------------------------------------------
\begin{abstract}

Effective collaborative work in diagnostic medical imaging is not
trivial due to the large amounts of complex data involved, a (non-linear)
workflow involving experts in different domains, and a lack of
versatility in the current tools employed in healthcare. In this
paper, we aim to introduce how the integration of visual storytelling
techniques together with provenance data in the analytic systems used
in medicine can compensate for these issues, by enhancing
communication of results and reproducibility of findings through
diagnostic provenance data. To this end, we illustrate how we can improve the interaction with provenance data displayed in a graph in order to facilitate authoring and the creation process of visual data stories.\\

%-------------------------------------------------------------------------
%  ACM CCS 1998
%  (see http://www.acm.org/about/class/1998)
% \begin{classification} % according to http:http://www.acm.org/about/class/1998
% \CCScat{Computer Graphics}{I.3.3}{Picture/Image Generation}{Line and curve generation}
% \end{classification}
%-------------------------------------------------------------------------

%The tool at \url{http://dl.acm.org/ccs.cfm} can be used to generate
% CCS codes.
%Example:
\begin{CCSXML}
<ccs2012>
<concept>
<concept_id>10010147.10010371.10010352.10010381</concept_id>
<concept_desc>Human-Centered Computing~Information visualization</concept_desc>
<concept_significance>300</concept_significance>
</concept>
<concept>
<concept_id>10010583.10010588.10010559</concept_id>
<concept_desc>Human-Centered Computing~Collaborative interaction</concept_desc>
<concept_significance>300</concept_significance>
</concept>
<concept>
<concept_id>10010583.10010584.10010587</concept_id>
<concept_desc>Human-Centered Computing~Interaction techniques</concept_desc>
<concept_significance>100</concept_significance>
</concept>
</ccs2012>
\end{CCSXML}

\ccsdesc[300]{Human-Centered Computing~Interaction Design}
\ccsdesc[300]{Human-Centered Computing~Visualization}


\printccsdesc   
\end{abstract}  
%-------------------------------------------------------------------------
\section{Introduction}

Performing data exploration is generally not trivial, especially in
healthcare where the data can be complex in nature and structure, and can be large in size. In addition, data analysis is further complicated by the fact that experts in different fields often cooperate on analyzing the same cases through collaborative
workflows. As a result, communicating and interpreting results is not
always straightforward, and misunderstanding and human errors can
occur.

In our study, we focus on visual storytelling for medical imaging
data. We have conducted a survey on the radiology workflow to obtain useful
insights on needs and concerns of radiologists regarding current IT
tools. Building upon already existing toolkits \cite{Gratzl2016,
Freire2006}, we developed a prototype of a visual storytelling tool
that allows users to perform data exploration and to create visual
data stories for presenting the findings based on provenance data of
the analysis process in diagnostic medical imaging.

The innovative aspect of our research is the use of visual
storytelling based on provenance data for scientific visualization in
medical data exploration. According to the respondents and the literature, current software systems lack flexibility in delivering results during both the presentation and exploration stages. Our work ties the information provided by images, user interactions, and exploration findings into a visual story, and thus it creates a clear connection between them. Therefore, the main contributions of the final tool, of
which we present here the initial results, are an enhancement of
effective communication in cooperative work contexts, data
reproducibility for informed decision-making, and improvement of
collaborative work currently based on text reports.

This way, the level of information details and the complexity of the visual data stories can also be adapted based on the target audience and purpose. For example, users might create more intuitive stories with several frames and descriptive annotations for communication with patients, whereas they might use a lower number of frames and medical jargon for communication with physicians.

We expect that radiologists can reproduce findings during their
workflow by interacting with a provenance graph, and present them in a
more efficient and visual way. Thus, the provenance graph should
enable users in interacting with it in an intuitive manner. This can
be achieved by implementing functions aiming at simplifying
the provenance data processing based on specific criteria.


%-------------------------------------------------------------------------
\section{Related Work}

In specifying our model of visual storytelling, we adopted the CLUE
(Capture, Label, Understand, Explain) model for data exploration and
presentation developed by Gratzl et al. \cite{Gratzl2016}, which
consists of three stages: \emph{exploration}, \emph{authoring},
and \emph{presentation}, offering reproducibility of results.
%
A related interesting work is \emph{VisTrails}, a system that provides
an infrastructure for recording and visually analyzing provenance data
of exploratory tasks \cite{Freire2006, Callahan2006,
Silva2007}. Although the use of visual storytelling in medicine has
not been deeply explored yet during the last decade, in contrast with
the use of data-driven stories for information communication in
science \cite{Segel2010, Stolper2017}, Wohlfart showed how visual
storytelling can be associated with volume visualization
\cite{Wohlfart2006}.
%
Furthermore, several works investigated how provenance data can be
used for supporting scientific workflows, how it can be visualized,
and how the history management can be improved \cite{Heer2008,
Simmhan2005a, Acar2010}.
%
Finally, we refer to Ma \cite{Ma1999, Jankun-Kelly2001}, who studied
scientific visualization for exploratory purposes and investigated the
user interface design space for collaborative settings.

%-------------------------------------------------------------------------


\section{Survey: the Radiology Workflow}

Meeting with radiology experts and conducting a survey was essential to
gather more information and understanding of the workflow in medical
imaging. A questionnaire was designed in collaboration with a
radiologist and doctor of nuclear medicine, which was composed of 15
questions relating to the following aspects of the radiology workflow:

\begin{itemize}
\item Data Used
\item Image Assessment
\item Data Exploration
\item Collaborative Work
\end{itemize}

The survey was conducted by using the CASI (computer-assisted self-interviews) technique \cite{Herington2012} and 17
international potential users (i.e., radiologists, doctors of nuclear
medicine, and residents) participated. The focus was on investigating
how radiologists perform medical diagnostic imaging, and how they
collaborate with other radiologists and physicians.

\begin{figure}[hbtp]
\centering
\includegraphics[width=.9 \linewidth]{Rplot}
\caption{\label{fig:1} The histogram of user interactions performed
during image assessment according to 17 respondents.}
\end{figure}

\paragraph*{Data Used.} What emerged from the survey is that most of the
users analyze complex 3D data (e.g., CT and MRI scans) to obtain
different kinds of information depending on the clinical questions.  During
diagnosis, reference protocols, patient history, and specific
meta-data (contrast medium given, slice thickness, type of MRI
sequence) are consulted before the image assessment itself.

\paragraph*{Image Assessment.} The typical working procedure starts with
arranging the given images, performing some windowing, zooming and
measurements, and preparing a (structured) text report.

\paragraph*{Data Exploration.} The most common user interaction techniques
used are selection, rotation, annotation, zooming, scrolling,
translation, and highlighting as shown in Fig.~\ref{fig:1}.

\paragraph*{Collaborative Work.} Furthermore, according to the
respondents, collaborative work can be improved by associating key
images and measurements with the structured reports to make them more
easily-retrievable (e.g., by using hyperlinks). 

Finally, automation in structure recognition, measurement systems, report compilation, and
windowing is also urgently awaited by some respondents to lighten the
individual workload.

\begin{figure*}[hbtp]
\centering
\includegraphics[angle = 270,width=.85\linewidth]{brain}
\caption{\label{fig:2} Left: Overview of our visual storytelling tool
with a main window for 2D and 3D data exploration, one widget for
changing the settings, and one widget for provenance graph
interaction. Right: A provenance graph with multiple branches,
thumbnails of the main window in the end-nodes, and image preview
and details on-demand (the highlighted end-node).}
\end{figure*}

\section{A Visual Storytelling Tool for Medical Imaging Data}

After conducting the survey, we define the main features of the
envisioned tool as well as specific elements of the provenance graph. 
%extending the feature set of the pre-existing provenance graph implementation with features %that are more in line with the specific needs of the radiology workflow.

\subsection{The Main Features of a Visual Storytelling Tool}
% First of all, the data exploration of 3D images can be facilitated
% by using novel user
% interaction %techniques (e.g., touch-screen, zSpace, AR) to allow data manipulation of multiple (colluded) objects in %a collaborative setting, taking measurements, and image assessment.\\

Medical imaging is usually employed in multi-disciplinary environments
where many kinds of data should be processed, and experts with
different specialized and technical knowledge have to collaborate.
First of all, the data exploration of 3D images can be performed as
illustrated in Fig.~\ref{fig:2}.

The figure shows an overview of our prototype built upon the Phovea
framework \cite{Gratzl2016} and the AMI toolkit \cite{AMI} used for exploring brain image data. It can be seen how the main window for the 2D and 3D
data exploration (on the left side) is supported by two widgets for
changing the settings and for retrieving provenance data. This is
visually represented by an ordered tree with multiple branches and
thumbnails (on the right side).

On top of that, an authoring tool should be integrated to enable making
annotations about exploration discoveries on the data itself. Along
with this, provenance data for the visual exploration can be collected and visualized in an
interactive provenance graph, providing information about the analysis
process made by the user(s) and for reproducing particular steps of the
analysis.
Moreover, the tool is equipped with a presentation mode to fully
incorporate the visual storytelling concept. Users can present final
and partial results to various audiences, through a sequence
of visualizations and using a variety of available visual storytelling
techniques \cite{Segel2010, Heer2008}.

\subsection{User Interaction with the Provenance Graph}

Since many considerations have to be made before achieving our
ultimate goal of developing a validated visual storytelling tool, we
started focusing on the user interaction with the provenance graph,
which is a key element of our project.  Navigating through an
interactive ordered tree including multiple branches for each
different exploratory decision and user, it is possible to
extend/author the data exploration and to adjust it an unlimited
number of times at any phase of the analysis.

In developing an interactive tool and its features, a set of rules
should be defined in order to build interconnected functions upon
them. Since we aim to give users more flexibility, allowing them to
choose at which level of granularity (or abstraction) the provenance
data should be represented, we considered two well-known approaches
which illustrate taxonomies to categorize user
interactions. Shneiderman defined \emph{a task by data type taxonomy},
which became a landmark model in Information Visualization
\cite{Shneiderman1996}, whereas Yi et al. stressed the relevance of
\emph{user intents} in categorizing user interactions
\cite{Yi2007}.

However, our scenario is slightly different since we are in a visual
storytelling context where user interactions for authoring play a
crucial role. Therefore, we assume that the user intents considered for
their categorization are also different.  Based on the survey results
and adapting the existing taxonomies to our situation, we envision the
process of 3D data analysis by visual storytelling tools as a (non-linear) sequence
of user interactions to configure, explore, select, derive information
from, and annotate the input data. 
Thus, we obtained six (non-exhaustive) classes of user interactions:

\begin{itemize}
\item \emph{Configure} (e.g., show the rendering, switch from 3D to 2D view)
\item \emph{Explore} (e.g., rotate, zoom, translate the slicing plane)
\item \emph{Select} (e.g., highlight or select a specific area)
\item \emph{Derive} (e.g., measure a distance or an angle)
\item \emph{Annotate} (e.g., make annotations)
\item \emph{Provenance} (e.g., provenance graph interaction)
\end{itemize}

% Although it was out of the scope of this short paper and focus of future work, a short explanation of a % categorization of user interaction techniques for visual storytelling tools was needed for introducing 
% some of the provenance graph features.\\
% The \emph{merging} function has to be based also on \emph{merging rules} and the concept of %\emph{key node} as we aim to describe with the support of a simple example illustrated in Fig.~%\ref{fig:3}.

Whereas \emph{Explore} and \emph{Select} do not need further
description, we grouped under \emph{Configure} all the interactions
related to 3D data visualization and its configuration. The classes
\emph{Derive} and \emph{Annotate} include all the user interactions
which lead to making measurements and annotation during data
exploration, while the \emph{Provenance} interactions are those
related to the provenance \emph{graph} interaction.

Hence, we define four grouping strategies, each corresponding to a certain level of abstraction, for provenance graph nodes:

\begin{itemize}
\item \emph{no grouping applied} (i.e., all the single user
interactions are shown)
\item \emph{per parameter change} (i.e., only user interactions with
parameters significantly different are shown)
\item \emph{per user interaction} (e.g., rotation, zoom, highlighting)
\item \emph{per user intent} (e.g., \emph{Configure}, \emph{Explore}, \emph{Select})
\end{itemize}

We first illustrate this on a simple example in Fig.~\ref{fig:3}. 
A provenance graph shows that three rotations were sequentially performed, and among them, the first and second ones were not significantly different in terms of parameter (angle)
change. Then, zoom and highlighting were also performed. We omit an
explanation of how to define the thresholds, as this is out of the
scope of this work.  Thus, \emph{grouping} not only depends on the
user interaction categories, but also on the level of abstraction
chosen.



\begin{figure}[b]
\centering
 \includegraphics[width=1 \linewidth]{opt1}
\put(-98,83.5){\scalebox{0.8}{\color[RGB]{252,197,192} $(\alpha)$}}
\put(-98,64.8){\scalebox{0.8}{\color[RGB]{252,197,192} $(\beta)$}}
\put(-98,45.5){\scalebox{0.8}{\color[RGB]{252,146,114} $(\gamma)$}}
\put(-76,73.5){\scalebox{0.7} {$\alpha$}}
\put(-71.5,73.5){\scalebox{0.6} {$\sim$}}
\put(-66,73.5){\scalebox{0.7} {$\beta$}}
\caption{\label{fig:3} A visual explanation of how data would be visualized at different levels of abstraction (i.e., no
grouping, per parameter change, per user interaction, and per user
intent), where the color encoding represents the category of nodes.}
\end{figure}

%\begin{figure}[b]
%\centering
%\includegraphics[width=1 \linewidth]{opt1}
%\caption{\label{fig:3} A visual explanation of how data would be visualized at different levels of abstraction (i.e., no
%grouping, per parameter change, per user interaction, and per user
%intent), where the color encoding represents the category of nodes.}
%\end{figure}

In case of grouping per user intent, only two nodes would be shown
after the initial status: one for representing \emph{Exploration}, and
one for representing \emph{Selection}.  In contrast, three nodes would be 
shown after grouping per user interaction: one per rotation, one per
zoom, and one per highlighting. Finally, only nodes representing
user interactions not significantly different in terms of parameter
change would be collapsed in the low-level scenario.

However, if we consider more complex cases, some additional rules must be set. As an example, an ordered tree with multiple branches and with nodes belonging to different classes (encoded by color) is illustrated in Fig.~\ref{fig:4}, left.
Since we aim to reduce the information overload in the provenance graph, only nodes relevant for data exploration and (visual) data story creation at a certain level of abstraction should be visualized. To this end, we classify all nodes in the provenance graph into two categories: \emph{key nodes} (marked by~\includegraphics[width=.25cm]{b.pdf}) and \emph{regular nodes} (marked by~\includegraphics[width=.25cm]{w}), as illustrated in Fig.~\ref{fig:4}, center. The \emph{grouping} function should not group  two or more key nodes. Thus, we define a key node as any node of the following mutually exclusive node types: 

\begin{figure}[t]
\centering
\includegraphics[width=.8\linewidth]{class.pdf}
\caption{\label{fig:4} A visual representation of how input nodes (left)
are classified (center), and then grouped (right). The color encoding in the first (left) and last (right) graph represents the (arbitrary) class of nodes, whereas in the central graph, black nodes are \emph{key nodes}, and white nodes are \emph{regular nodes}. The node size on the right encodes the number of nodes grouped.}
\end{figure}

\begin{itemize}
\item \emph{Root} (i.e., the starting node of the provenance graph);
\item \emph{Leaf} (i.e., a node with no children);
\item \emph{Subroot} (i.e., a node with more than one child);
\item any other node with interaction of a different class to its child's.
\end{itemize}

The remaining (regular) nodes are considered non-informative, and are grouped downwards onto a key node; see Fig.~\ref{fig:4}, right. The node size encodes the number of nodes grouped. This algorithm works independently of the level of data granularity, so it can be applied with different levels of abstraction.

%Merging two branches can produce different results not only because of the merging direction (i.e., from %A to B, or from B to A), but also because of the presence and location of a \emph{key node} (i.e., red %dot) in the provenance graph. Therefore, the \emph{merging rules} are linked to the above-mentioned %levels of abstraction since the categorization depends on them.

%Hence, three different cases are possible, as shown in Fig.~\ref{fig:4}:
%\begin{enumerate}
%\item There are no \emph{key nodes} (i.e., all the user interactions belong to the same category).
%\item There is one \emph{key node} either in A or B's branch (i.e., all the user interactions belong to %the same category, except of those represented by the red node and its children).
%\item Either A or B is a \emph{key node} (i.e., all the user interactions belong to the same category, %except of that one represented by the red node).
%\end{enumerate}
%In case of more complex cases with several user interactions, the same concept is applied multiple times. 


%-------------------------------------------------------------------------
\section{Discussion}

The conducted survey provided a starting point for outlining the main
features of a visual storytelling tool that can compensate for the
lack of flexibility in authoring and presenting findings of current
tools. As described by the survey respondents, they lack an efficient
system for communicating effectively and for collaborative work.  We
consider the survey results reliable because of the sample size (i.e.,
more than 15 participants).

Using a visual storytelling framework based on provenance data in
combination with user interaction techniques for exploration of
complex data, research findings can be validated with evidence and
previous analyses can be retrieved, reconsidered, and reused during
future assessments. In this way, the risk of encountering human
mistakes in the decision-making process due to misunderstanding or
incorrect interpretation of results can be decreased. According to the potential users' statements, our prototype meets the initial requirements since it allows other doctors to understand and agree on the conclusions drawn by the investigating doctor. In addition, integrating the visual storytelling concept into traditional imaging data exploration seems to be promising for replacing text reports.

Furthermore, outcomes of medical diagnoses will become more reliable
even in a collaborative setting context, since they can be linked back
to (provenance) data and authors that generated them.  We believe that
the \emph{grouping} function is crucial for the story creation process
to offset the large amount of data available and the unrepeatability
of analysis steps. Combined with different levels of granularity of
the visually represented provenance data and with the associated user
interaction categories, it can facilitate users to interact with
their (non-linear) analysis process during both data exploration and
data story creation.  Additionally, color encoding and thumbnails can
also improve the provenance graph interaction in both the exploration
and presentation stages.

%Finally, minor features such as messaging system for all the stakeholders and application of some machine %learning techniques for automating certain tasks (e.g., images arrangement based on clinical questions, %availability of related meta-data), together with an intuitive user interface would make the tool %adequate for our use case, especially.

%-------------------------------------------------------------------------
\section{Conclusion and Future Work}

In the last years, many efforts have been made in investigating the
application of visual storytelling techniques in science. Although we
are still in an exploratory stage, there is evidence of the beneficial
effects of storytelling for data presentation, and of a need to
improve communication in collaborative work settings.  This has been
confirmed by survey results regarding radiology as field of
application. Based on this and on previous works, we outlined a visual
storytelling tool aiming to compensate for flaws and deficiencies of
the current tools used for diagnostic medical imaging.

In future work, we aim to extend our method. We plan to perform a user study to learn more about user intent and to potentially refine the taxonomy of user interactions.
Furthermore, evaluating the effectiveness of the tool, and the individual effects of its current features (e.g., how much information is lost per \emph{grouping} at different levels of abstraction) as well
as novel ones such as merging branches based on some of the
above-mentioned rules is our next objective.
Although the initial case study is radiology, the tool has not been envisioned as domain-specific and it is easy to generalize (e.g., using different features, taxonomies, and levels of abstraction). For this reason, we want to investigate differences in the visual storytelling tool settings for different domains, and the contributing factors of specific application scenarios.




%Creating a higher level of user interactions based on "goals" (which is different from %"intents"), we can %make 'grouping' and 'merging' more intuitive (and maybe a full paper).

%-------------------------------------------------------------------------
\section{Acknowledgements}
This project has been funded by the Netherlands eScience Center
(NLeSC), project number DTEC.2016.015, under the call "Disruptive
Technologies".
%This project has been funded by the Netherlands eScience Center (NLeSC), project
%number DTEC.2016.015, under the call "Joint eScience and Data Science across
%Top Sectors, DTEC 2016: Disruptive Technologies", organized in collaboration with
%Netherlands Organisation for Scientific Research Physical Sciences (NWO) and
%Dutch Digital Delta.

%------------------------------------------------------------------------
%\subsubsection*{Configuration Notes: Acrobat Distiller}

%We recommend to use a Distiller job options file that embeds
%all typefaces and does not downsample or subsample images when creating the PDF document.
%------------------------------------------------------------------------
% \subsection{Exclusive License Form}

%You must include your signed Eurographics Exclusive License Form 
%when you submit your finished paper. We MUST have this form before
%your paper can be published in the proceedings. 

